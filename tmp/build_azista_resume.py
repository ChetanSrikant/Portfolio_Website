from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.style import WD_STYLE_TYPE
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING, WD_TAB_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.opc.constants import RELATIONSHIP_TYPE as RT
from docx.shared import Inches, Pt, RGBColor


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "output" / "resume"
OUTPUT_PATH = OUTPUT_DIR / "Chetan_Srikant_Mandiga_Azista_Image_Processing_Engineer.docx"

# compact_reference_guide, with named resume-specific overrides:
# - resume_single_page_geometry: 0.55in top/bottom and 0.60in left/right.
# - resume_ats_font: Arial throughout for predictable ATS extraction.
# - resume_compact_type: 9.0pt body with single spacing.
# - resume_monochrome_accent: dark navy instead of the preset's brighter blue.
INK = RGBColor(28, 34, 42)
NAVY = RGBColor(21, 59, 91)
MUTED = RGBColor(78, 88, 98)
LIGHT_RULE = "AAB4BE"
FONT = "Arial"


def set_run_font(run, size=9.4, bold=False, italic=False, color=INK):
    run.font.name = FONT
    run._element.get_or_add_rPr().get_or_add_rFonts().set(qn("w:ascii"), FONT)
    run._element.get_or_add_rPr().get_or_add_rFonts().set(qn("w:hAnsi"), FONT)
    run.font.size = Pt(size)
    run.bold = bold
    run.italic = italic
    run.font.color.rgb = color


def set_paragraph_spacing(paragraph, before=0, after=0, line=1.0):
    fmt = paragraph.paragraph_format
    fmt.space_before = Pt(before)
    fmt.space_after = Pt(after)
    fmt.line_spacing_rule = WD_LINE_SPACING.SINGLE
    fmt.line_spacing = line


def add_hyperlink(paragraph, text, url, size=8.4, color=NAVY):
    part = paragraph.part
    rel_id = part.relate_to(url, RT.HYPERLINK, is_external=True)
    hyperlink = OxmlElement("w:hyperlink")
    hyperlink.set(qn("r:id"), rel_id)
    run = OxmlElement("w:r")
    r_pr = OxmlElement("w:rPr")
    color_el = OxmlElement("w:color")
    color_el.set(qn("w:val"), str(color))
    r_pr.append(color_el)
    r_fonts = OxmlElement("w:rFonts")
    r_fonts.set(qn("w:ascii"), FONT)
    r_fonts.set(qn("w:hAnsi"), FONT)
    r_pr.append(r_fonts)
    sz = OxmlElement("w:sz")
    sz.set(qn("w:val"), str(int(size * 2)))
    r_pr.append(sz)
    run.append(r_pr)
    text_el = OxmlElement("w:t")
    text_el.text = text
    run.append(text_el)
    hyperlink.append(run)
    paragraph._p.append(hyperlink)


def add_bottom_border(paragraph, color=LIGHT_RULE, size="6", space="2"):
    p_pr = paragraph._p.get_or_add_pPr()
    p_bdr = p_pr.find(qn("w:pBdr"))
    if p_bdr is None:
        p_bdr = OxmlElement("w:pBdr")
        p_pr.append(p_bdr)
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), size)
    bottom.set(qn("w:space"), space)
    bottom.set(qn("w:color"), color)
    p_bdr.append(bottom)


def create_bullet_numbering(document):
    numbering = document.part.numbering_part.element
    abstract_ids = [int(node.get(qn("w:abstractNumId"))) for node in numbering.findall(qn("w:abstractNum"))]
    num_ids = [int(node.get(qn("w:numId"))) for node in numbering.findall(qn("w:num"))]
    abstract_id = max(abstract_ids, default=0) + 1
    num_id = max(num_ids, default=0) + 1

    abstract = OxmlElement("w:abstractNum")
    abstract.set(qn("w:abstractNumId"), str(abstract_id))
    multi = OxmlElement("w:multiLevelType")
    multi.set(qn("w:val"), "singleLevel")
    abstract.append(multi)
    lvl = OxmlElement("w:lvl")
    lvl.set(qn("w:ilvl"), "0")
    start = OxmlElement("w:start")
    start.set(qn("w:val"), "1")
    num_fmt = OxmlElement("w:numFmt")
    num_fmt.set(qn("w:val"), "bullet")
    lvl_text = OxmlElement("w:lvlText")
    lvl_text.set(qn("w:val"), "\u2022")
    lvl_jc = OxmlElement("w:lvlJc")
    lvl_jc.set(qn("w:val"), "left")
    p_pr = OxmlElement("w:pPr")
    tabs = OxmlElement("w:tabs")
    tab = OxmlElement("w:tab")
    tab.set(qn("w:val"), "num")
    tab.set(qn("w:pos"), "300")
    tabs.append(tab)
    ind = OxmlElement("w:ind")
    ind.set(qn("w:left"), "300")
    ind.set(qn("w:hanging"), "180")
    p_pr.append(tabs)
    p_pr.append(ind)
    r_pr = OxmlElement("w:rPr")
    r_fonts = OxmlElement("w:rFonts")
    r_fonts.set(qn("w:ascii"), FONT)
    r_fonts.set(qn("w:hAnsi"), FONT)
    r_pr.append(r_fonts)
    for node in (start, num_fmt, lvl_text, lvl_jc, p_pr, r_pr):
        lvl.append(node)
    abstract.append(lvl)
    numbering.append(abstract)

    num = OxmlElement("w:num")
    num.set(qn("w:numId"), str(num_id))
    abstract_ref = OxmlElement("w:abstractNumId")
    abstract_ref.set(qn("w:val"), str(abstract_id))
    num.append(abstract_ref)
    numbering.append(num)
    return num_id


def apply_num(paragraph, num_id):
    p_pr = paragraph._p.get_or_add_pPr()
    num_pr = OxmlElement("w:numPr")
    ilvl = OxmlElement("w:ilvl")
    ilvl.set(qn("w:val"), "0")
    num_id_el = OxmlElement("w:numId")
    num_id_el.set(qn("w:val"), str(num_id))
    num_pr.extend([ilvl, num_id_el])
    p_pr.append(num_pr)


def add_section_heading(document, text):
    p = document.add_paragraph(style="Resume Section")
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text.upper())
    set_run_font(run, size=9.6, bold=True, color=NAVY)
    add_bottom_border(p)
    return p


def add_skill_line(document, label, value):
    p = document.add_paragraph(style="Resume Body")
    set_paragraph_spacing(p, after=0.6)
    label_run = p.add_run(label + ": ")
    set_run_font(label_run, size=9.0, bold=True, color=NAVY)
    value_run = p.add_run(value)
    set_run_font(value_run, size=9.0)


def add_entry_header(document, title, date, subtitle=None, location=None):
    p = document.add_paragraph(style="Resume Entry")
    p.paragraph_format.keep_with_next = True
    p.paragraph_format.tab_stops.add_tab_stop(Inches(7.25), WD_TAB_ALIGNMENT.RIGHT)
    left = p.add_run(title)
    set_run_font(left, size=9.35, bold=True)
    right = p.add_run("\t" + date)
    set_run_font(right, size=8.9, bold=True, color=MUTED)
    if subtitle:
        s = document.add_paragraph(style="Resume Subentry")
        s.paragraph_format.keep_with_next = True
        s.paragraph_format.tab_stops.add_tab_stop(Inches(7.25), WD_TAB_ALIGNMENT.RIGHT)
        sr = s.add_run(subtitle)
        set_run_font(sr, size=8.75, italic=True, color=MUTED)
        if location:
            lr = s.add_run("\t" + location)
            set_run_font(lr, size=8.65, italic=True, color=MUTED)


def add_bullet(document, text, num_id):
    p = document.add_paragraph(style="Resume Bullet")
    apply_num(p, num_id)
    p.paragraph_format.keep_together = True
    run = p.add_run(text)
    set_run_font(run, size=8.95)
    return p


def add_project(document, title, technologies, description, num_id):
    p = document.add_paragraph(style="Resume Entry")
    p.paragraph_format.keep_with_next = True
    name = p.add_run(title)
    set_run_font(name, size=9.2, bold=True)
    tech = p.add_run(" | " + technologies)
    set_run_font(tech, size=8.6, italic=True, color=MUTED)
    add_bullet(document, description, num_id)


def build_resume():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    document = Document()
    section = document.sections[0]
    section.start_type = WD_SECTION.NEW_PAGE
    section.page_width = Inches(8.5)
    section.page_height = Inches(11)
    section.top_margin = Inches(0.55)
    section.bottom_margin = Inches(0.50)
    section.left_margin = Inches(0.60)
    section.right_margin = Inches(0.60)
    section.header_distance = Inches(0.25)
    section.footer_distance = Inches(0.25)

    styles = document.styles
    normal = styles["Normal"]
    normal.font.name = FONT
    normal._element.rPr.rFonts.set(qn("w:ascii"), FONT)
    normal._element.rPr.rFonts.set(qn("w:hAnsi"), FONT)
    normal.font.size = Pt(9.4)
    normal.font.color.rgb = INK
    normal.paragraph_format.space_before = Pt(0)
    normal.paragraph_format.space_after = Pt(0)
    normal.paragraph_format.line_spacing = 1.0

    for name in ("Resume Body", "Resume Section", "Resume Entry", "Resume Subentry", "Resume Bullet"):
        if name not in styles:
            styles.add_style(name, WD_STYLE_TYPE.PARAGRAPH)
        style = styles[name]
        style.font.name = FONT
        style._element.rPr.rFonts.set(qn("w:ascii"), FONT)
        style._element.rPr.rFonts.set(qn("w:hAnsi"), FONT)
        style.font.size = Pt(9.4)
        style.paragraph_format.space_before = Pt(0)
        style.paragraph_format.space_after = Pt(0)
        style.paragraph_format.line_spacing = 1.0
    styles["Resume Section"].paragraph_format.space_before = Pt(5.2)
    styles["Resume Section"].paragraph_format.space_after = Pt(2.4)
    styles["Resume Entry"].paragraph_format.space_before = Pt(1.0)
    styles["Resume Entry"].paragraph_format.space_after = Pt(0)
    styles["Resume Subentry"].paragraph_format.space_before = Pt(0)
    styles["Resume Subentry"].paragraph_format.space_after = Pt(0.3)
    styles["Resume Bullet"].paragraph_format.space_before = Pt(0)
    styles["Resume Bullet"].paragraph_format.space_after = Pt(1.4)
    styles["Resume Bullet"].paragraph_format.line_spacing = 1.0

    bullet_num_id = create_bullet_numbering(document)

    # memo_masthead-inspired opening block, adapted for an ATS resume.
    p = document.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_paragraph_spacing(p, after=0)
    run = p.add_run("CHETAN SRIKANT MANDIGA")
    set_run_font(run, size=19.5, bold=True, color=NAVY)

    p = document.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_paragraph_spacing(p, after=1.2)
    run = p.add_run("IMAGE PROCESSING ENGINEER | COMPUTER VISION & APPLIED AI")
    set_run_font(run, size=9.5, bold=True, color=MUTED)

    p = document.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_paragraph_spacing(p, after=2.0)
    r = p.add_run("Hyderabad, Telangana | +91 9989714684 | ")
    set_run_font(r, size=8.25, color=MUTED)
    add_hyperlink(p, "chetansrikantmandiga@gmail.com", "mailto:chetansrikantmandiga@gmail.com")
    r = p.add_run(" | ")
    set_run_font(r, size=8.25, color=MUTED)
    add_hyperlink(p, "LinkedIn", "https://www.linkedin.com/in/chetan-srikant-mandiga-514784248/")
    r = p.add_run(" | ")
    set_run_font(r, size=8.25, color=MUTED)
    add_hyperlink(p, "GitHub", "https://github.com/ChetanSrikant")
    add_bottom_border(p, color="6F8394", size="8", space="4")

    add_section_heading(document, "Professional Summary")
    p = document.add_paragraph(style="Resume Body")
    set_paragraph_spacing(p, after=0.5)
    summary = (
        "Computer Science graduate and software engineer with hands-on computer vision experience in Python, "
        "OpenCV, NumPy, PyTorch, and TensorFlow/Keras. Built real-time frame-processing, object-detection, "
        "segmentation, enhancement, and visual-retrieval workflows, including a YOLOv11 image-search pipeline "
        "and driver-drowsiness detection. Experienced in production troubleshooting, AI-backed application delivery, "
        "Git workflows, and translating technical outputs into usable software. Seeking to apply this foundation "
        "to satellite-image preprocessing and Earth-observation workflows."
    )
    set_run_font(p.add_run(summary), size=9.1)

    add_section_heading(document, "Technical Skills")
    add_skill_line(document, "Languages & libraries", "Python, NumPy, OpenCV, Pandas, scikit-learn, PyTorch, TensorFlow/Keras")
    add_skill_line(document, "Image processing", "Enhancement, filtering, thresholding, geometric transforms, edge/contour detection, region processing, segmentation, feature extraction")
    add_skill_line(document, "Computer vision", "YOLOv11, Detectron2, Faster R-CNN, U-Net, CNNs, transfer learning, real-time camera pipelines")
    add_skill_line(document, "Engineering tools", "Git, Streamlit, REST APIs, Data Structures & Algorithms, Java, C++, JavaScript, React, Node.js, MongoDB, MySQL")

    add_section_heading(document, "Professional Experience")
    add_entry_header(document, "Systems Engineer - IAM Cloud (Active Directory / Azure AD)", "Aug 2025 - Present", "HCLTech", "Noida, India")
    add_bullet(document, "Troubleshoot production authentication, directory synchronization, account lockout, and access-control issues across enterprise Active Directory and Azure AD environments.", bullet_num_id)
    add_bullet(document, "Support reliable user-provisioning and hybrid-identity workflows, applying structured debugging and operational ownership in a production environment.", bullet_num_id)

    add_entry_header(document, "Full Stack Data Scientist", "Mar 2025 - Aug 2025", "Innomatics Research Labs", "Hyderabad, India")
    add_bullet(document, "Developed AI-driven data applications for enterprise forecasting and TGSRTC public-transport demand analysis, integrating model outputs with interactive web interfaces and Git-based delivery workflows.", bullet_num_id)
    add_bullet(document, "Contributed substantially to the application and visualization layer of the winning Telangana AI Rising / AI4TG transport solution, making forecasts inspectable for stakeholder analysis.", bullet_num_id)

    add_entry_header(document, "Project Intern", "May 2023 - Jul 2023", "DRDO - Defence Research and Development Organisation", "Hyderabad, India")
    add_bullet(document, "Designed Python/Tkinter interfaces for RS-422 device communication and improved operator workflows by reducing communication errors during testing.", bullet_num_id)

    add_section_heading(document, "Selected Image Processing Projects")
    add_project(
        document,
        "Computer Vision Image Search",
        "Python, YOLOv11, Streamlit",
        "Built an end-to-end visual-retrieval pipeline that detects objects in image collections, converts labels into a searchable index, matches queries, ranks results, and presents retrieved images through an interface.",
        bullet_num_id,
    )
    add_project(
        document,
        "Driver Drowsiness Detection",
        "Python, OpenCV, NumPy, TensorFlow/Keras",
        "Processed live camera frames to detect face and eye regions, interpret eye/facial signals, and trigger alerts; optimized the prototype for responsive real-time inference while documenting its safety limitations.",
        bullet_num_id,
    )
    add_project(
        document,
        "Digital Image Processing Laboratory",
        "OpenCV, NumPy, Python",
        "Implemented enhancement, CLAHE and histogram equalization, filtering, color thresholding, affine/perspective transforms, contours, edge detection, region processing, resizing, and segmentation workflows in reproducible notebooks.",
        bullet_num_id,
    )
    add_project(
        document,
        "Detection & Segmentation Experiments",
        "PyTorch, YOLOv11, Detectron2, Faster R-CNN, U-Net",
        "Built notebook-based detection and segmentation experiments covering custom YOLOv11 training, instance segmentation, Faster R-CNN, Detectron2, and U-Net-based image segmentation.",
        bullet_num_id,
    )

    add_section_heading(document, "Education & Recognition")
    add_entry_header(document, "B.Tech, Computer Science and Engineering - BML Munjal University", "2021 - 2025")
    p = document.add_paragraph(style="Resume Body")
    set_paragraph_spacing(p, after=0.2)
    set_run_font(p.add_run("Minor in Entrepreneurship (2023 - 2025) | Relevant academic work: Digital Image Processing and Machine Learning"), size=8.8, color=MUTED)
    p = document.add_paragraph(style="Resume Body")
    set_paragraph_spacing(p, after=0)
    set_run_font(p.add_run("Winner, AI4TG Grand Challenge / Telangana AI Rising - Public transport utilization solution (team recognition)"), size=8.8, bold=True, color=NAVY)

    props = document.core_properties
    props.title = "Chetan Srikant Mandiga - Image Processing Engineer Resume"
    props.subject = "Application tailored to Azista Space"
    props.author = "Chetan Srikant Mandiga"
    props.keywords = "Image Processing, Computer Vision, Python, NumPy, OpenCV, PyTorch, YOLOv11"

    document.save(OUTPUT_PATH)
    print(OUTPUT_PATH)


if __name__ == "__main__":
    build_resume()
