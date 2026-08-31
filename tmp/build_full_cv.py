from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.style import WD_STYLE_TYPE
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK, WD_LINE_SPACING, WD_TAB_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.opc.constants import RELATIONSHIP_TYPE as RT
from docx.shared import Inches, Pt, RGBColor


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "cv" / "Chetan_Srikant_Mandiga_Full_CV.docx"
FONT = "Arial"
INK = RGBColor(27, 34, 43)
NAVY = RGBColor(20, 55, 86)
MUTED = RGBColor(82, 91, 101)
RULE = "A8B3BD"


def font(run, size=9.4, bold=False, italic=False, color=INK):
    run.font.name = FONT
    rfonts = run._element.get_or_add_rPr().get_or_add_rFonts()
    rfonts.set(qn("w:ascii"), FONT)
    rfonts.set(qn("w:hAnsi"), FONT)
    run.font.size = Pt(size)
    run.bold = bold
    run.italic = italic
    run.font.color.rgb = color


def spacing(p, before=0, after=0, line=1.0):
    f = p.paragraph_format
    f.space_before = Pt(before)
    f.space_after = Pt(after)
    f.line_spacing_rule = WD_LINE_SPACING.SINGLE
    f.line_spacing = line


def hyperlink(p, text, url, size=8.6):
    rel = p.part.relate_to(url, RT.HYPERLINK, is_external=True)
    link = OxmlElement("w:hyperlink")
    link.set(qn("r:id"), rel)
    r = OxmlElement("w:r")
    rpr = OxmlElement("w:rPr")
    rf = OxmlElement("w:rFonts")
    rf.set(qn("w:ascii"), FONT)
    rf.set(qn("w:hAnsi"), FONT)
    col = OxmlElement("w:color")
    col.set(qn("w:val"), "143756")
    sz = OxmlElement("w:sz")
    sz.set(qn("w:val"), str(int(size * 2)))
    rpr.extend([rf, col, sz])
    r.append(rpr)
    t = OxmlElement("w:t")
    t.text = text
    r.append(t)
    link.append(r)
    p._p.append(link)


def bottom_rule(p, color=RULE, size="6", space="2"):
    ppr = p._p.get_or_add_pPr()
    borders = OxmlElement("w:pBdr")
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), size)
    bottom.set(qn("w:space"), space)
    bottom.set(qn("w:color"), color)
    borders.append(bottom)
    ppr.append(borders)


def bullet_numbering(doc):
    numbering = doc.part.numbering_part.element
    aids = [int(x.get(qn("w:abstractNumId"))) for x in numbering.findall(qn("w:abstractNum"))]
    nids = [int(x.get(qn("w:numId"))) for x in numbering.findall(qn("w:num"))]
    aid, nid = max(aids, default=0) + 1, max(nids, default=0) + 1
    abstract = OxmlElement("w:abstractNum")
    abstract.set(qn("w:abstractNumId"), str(aid))
    multi = OxmlElement("w:multiLevelType")
    multi.set(qn("w:val"), "singleLevel")
    abstract.append(multi)
    lvl = OxmlElement("w:lvl")
    lvl.set(qn("w:ilvl"), "0")
    for tag, val in (("w:start", "1"), ("w:numFmt", "bullet"), ("w:lvlText", "•"), ("w:lvlJc", "left")):
        el = OxmlElement(tag)
        el.set(qn("w:val"), val)
        lvl.append(el)
    ppr = OxmlElement("w:pPr")
    ind = OxmlElement("w:ind")
    ind.set(qn("w:left"), "300")
    ind.set(qn("w:hanging"), "180")
    ppr.append(ind)
    lvl.append(ppr)
    abstract.append(lvl)
    numbering.append(abstract)
    num = OxmlElement("w:num")
    num.set(qn("w:numId"), str(nid))
    ref = OxmlElement("w:abstractNumId")
    ref.set(qn("w:val"), str(aid))
    num.append(ref)
    numbering.append(num)
    return nid


def apply_bullet(p, nid):
    ppr = p._p.get_or_add_pPr()
    numpr = OxmlElement("w:numPr")
    ilvl = OxmlElement("w:ilvl")
    ilvl.set(qn("w:val"), "0")
    numid = OxmlElement("w:numId")
    numid.set(qn("w:val"), str(nid))
    numpr.extend([ilvl, numid])
    ppr.append(numpr)


def section_heading(doc, text):
    p = doc.add_paragraph(style="CV Section")
    p.paragraph_format.keep_with_next = True
    font(p.add_run(text.upper()), 9.7, bold=True, color=NAVY)
    bottom_rule(p)


def entry(doc, title, date, organization=None, location=None):
    p = doc.add_paragraph(style="CV Entry")
    p.paragraph_format.keep_with_next = True
    p.paragraph_format.tab_stops.add_tab_stop(Inches(7.05), WD_TAB_ALIGNMENT.RIGHT)
    font(p.add_run(title), 9.45, bold=True)
    font(p.add_run("\t" + date), 8.8, bold=True, color=MUTED)
    if organization:
        s = doc.add_paragraph(style="CV Subentry")
        s.paragraph_format.keep_with_next = True
        s.paragraph_format.tab_stops.add_tab_stop(Inches(7.05), WD_TAB_ALIGNMENT.RIGHT)
        font(s.add_run(organization), 8.85, italic=True, color=MUTED)
        if location:
            font(s.add_run("\t" + location), 8.75, italic=True, color=MUTED)


def bullet(doc, text, nid, size=9.0):
    p = doc.add_paragraph(style="CV Bullet")
    apply_bullet(p, nid)
    p.paragraph_format.keep_together = True
    font(p.add_run(text), size)


def skill(doc, label, text):
    p = doc.add_paragraph(style="CV Body")
    spacing(p, after=0.8)
    font(p.add_run(label + ": "), 9.0, bold=True, color=NAVY)
    font(p.add_run(text), 9.0)


def project(doc, name, year, stack, text, nid, url=None, secondary=None):
    p = doc.add_paragraph(style="CV Entry")
    p.paragraph_format.keep_with_next = True
    if url:
        hyperlink(p, name, url, size=9.35)
    else:
        font(p.add_run(name), 9.35, bold=True)
    font(p.add_run(f" | {stack}"), 8.55, italic=True, color=MUTED)
    p.paragraph_format.tab_stops.add_tab_stop(Inches(7.05), WD_TAB_ALIGNMENT.RIGHT)
    font(p.add_run("\t" + year), 8.65, bold=True, color=MUTED)
    bullet(doc, text, nid, size=8.9)
    if secondary:
        bullet(doc, secondary, nid, size=8.75)


def page_field(p):
    font(p.add_run("CHETAN SRIKANT MANDIGA  •  CURRICULUM VITAE  •  "), 7.5, color=MUTED)
    fld = OxmlElement("w:fldSimple")
    fld.set(qn("w:instr"), "PAGE")
    p._p.append(fld)


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc = Document()
    sec = doc.sections[0]
    sec.start_type = WD_SECTION.NEW_PAGE
    sec.page_width, sec.page_height = Inches(8.5), Inches(11)
    sec.top_margin, sec.bottom_margin = Inches(0.62), Inches(0.55)
    sec.left_margin, sec.right_margin = Inches(0.68), Inches(0.68)
    sec.header_distance, sec.footer_distance = Inches(0.25), Inches(0.27)

    styles = doc.styles
    normal = styles["Normal"]
    normal.font.name = FONT
    normal._element.rPr.rFonts.set(qn("w:ascii"), FONT)
    normal._element.rPr.rFonts.set(qn("w:hAnsi"), FONT)
    normal.font.size = Pt(9.4)
    normal.font.color.rgb = INK
    normal.paragraph_format.space_after = Pt(0)
    normal.paragraph_format.line_spacing = 1.0
    for name in ("CV Body", "CV Section", "CV Entry", "CV Subentry", "CV Bullet"):
        if name not in styles:
            styles.add_style(name, WD_STYLE_TYPE.PARAGRAPH)
        st = styles[name]
        st.font.name = FONT
        st._element.rPr.rFonts.set(qn("w:ascii"), FONT)
        st._element.rPr.rFonts.set(qn("w:hAnsi"), FONT)
        st.font.size = Pt(9.3)
        st.paragraph_format.space_before = Pt(0)
        st.paragraph_format.space_after = Pt(0)
        st.paragraph_format.line_spacing = 1.0
    styles["CV Section"].paragraph_format.space_before = Pt(6.5)
    styles["CV Section"].paragraph_format.space_after = Pt(3.0)
    styles["CV Entry"].paragraph_format.space_before = Pt(1.6)
    styles["CV Subentry"].paragraph_format.space_after = Pt(0.4)
    styles["CV Bullet"].paragraph_format.space_after = Pt(1.8)

    footer = sec.footer.paragraphs[0]
    footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
    page_field(footer)
    nid = bullet_numbering(doc)

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    spacing(p)
    font(p.add_run("CHETAN SRIKANT MANDIGA"), 20.5, bold=True, color=NAVY)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    spacing(p, after=1.3)
    font(p.add_run("SOFTWARE ENGINEER  |  APPLIED AI, COMPUTER VISION & FULL-STACK SYSTEMS"), 9.25, bold=True, color=MUTED)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    spacing(p, after=2.2)
    font(p.add_run("Hyderabad, Telangana  |  +91 9989714684  |  "), 8.35, color=MUTED)
    hyperlink(p, "Email", "mailto:chetansrikantmandiga@gmail.com")
    font(p.add_run("  |  "), 8.35, color=MUTED)
    hyperlink(p, "LinkedIn", "https://www.linkedin.com/in/chetan-srikant-mandiga-514784248/")
    font(p.add_run("  |  "), 8.35, color=MUTED)
    hyperlink(p, "GitHub", "https://github.com/ChetanSrikant")
    bottom_rule(p, color="6E8293", size="8", space="4")

    section_heading(doc, "Profile")
    p = doc.add_paragraph(style="CV Body")
    spacing(p, after=0.5)
    font(p.add_run(
        "Computer Science graduate and systems engineer with experience across enterprise identity operations, "
        "AI-backed data applications, computer vision, and full-stack product development. Builds practical Python "
        "workflows using OpenCV, NumPy, PyTorch, TensorFlow/Keras, and scikit-learn, and turns model outputs into "
        "usable Streamlit or web interfaces. Recognized as part of the winning AI4TG public-transport solution team."
    ), 9.15)

    section_heading(doc, "Core Competencies")
    skill(doc, "Programming", "Python, Java, C++, JavaScript; Data Structures & Algorithms, OOP, debugging, system-design fundamentals")
    skill(doc, "AI & data", "NumPy, Pandas, scikit-learn, PyTorch, TensorFlow/Keras, forecasting, classification, feature engineering, model evaluation")
    skill(doc, "Computer vision", "OpenCV, YOLOv11, Detectron2, Faster R-CNN, U-Net, CNNs; enhancement, filtering, edges, contours, segmentation, feature extraction")
    skill(doc, "Applications & platforms", "React, Node.js/Express, Streamlit, Firebase, REST APIs, MongoDB, MySQL, Git, Active Directory, Azure AD")

    section_heading(doc, "Professional Experience")
    entry(doc, "Systems Engineer — IAM Cloud (Active Directory / Azure AD)", "Aug 2025 – Present", "HCLTech", "Noida, India")
    bullet(doc, "Manage enterprise Active Directory and Azure AD workflows spanning user provisioning, access control, and hybrid-identity integration.", nid)
    bullet(doc, "Troubleshoot authentication failures, account lockouts, directory synchronization, and access issues in production using structured root-cause analysis.", nid)
    bullet(doc, "Support reliable identity operations through incident ownership, documentation, and coordination across operational teams.", nid)

    entry(doc, "Full Stack Data Scientist", "Mar 2025 – Aug 2025", "Innomatics Research Labs", "Hyderabad, India")
    bullet(doc, "Built AI-backed applications for enterprise forecasting and TGSRTC public-transport demand analysis, connecting model outputs to interactive dashboards and stakeholder-facing workflows.", nid)
    bullet(doc, "Contributed substantially to the web application and visual-analysis layer of the winning Telangana AI Rising / AI4TG transport solution; made forecast outputs easier to inspect and communicate.", nid)
    bullet(doc, "Worked with forecasting models, a custom chatbot, CRISP-ML(Q), REST-style integration, and Git-based delivery practices across two end-to-end data platforms.", nid)

    entry(doc, "Project Intern", "May 2023 – Jul 2023", "DRDO — Defence Research and Development Organisation", "Hyderabad, India")
    bullet(doc, "Designed Python/Tkinter interfaces for RS-422 device communication, improving operator workflows and reducing communication errors during testing.", nid)

    section_heading(doc, "Education & Recognition")
    entry(doc, "B.Tech — Computer Science and Engineering", "2021 – 2025", "BML Munjal University", "India")
    p = doc.add_paragraph(style="CV Body")
    spacing(p, after=0.6)
    font(p.add_run("Minor in Entrepreneurship, 2023–2025  |  Academic work in Digital Image Processing and Machine Learning"), 8.9, color=MUTED)
    p = doc.add_paragraph(style="CV Body")
    font(p.add_run("Winner, AI4TG Grand Challenge / Telangana AI Rising — public-transport utilization solution (team recognition)"), 8.95, bold=True, color=NAVY)

    p = doc.add_paragraph()
    p.add_run().add_break(WD_BREAK.PAGE)

    section_heading(doc, "Selected Applied AI & Computer Vision Projects")
    project(doc, "TGSRTC Public Transport Demand Platform", "2025", "Forecasting, dashboards, decision support", "Contributed to the web application that surfaced public-transport demand forecasts through visual exploration and stakeholder-oriented interpretation; the team won the AI4TG Grand Challenge.", nid, secondary="Focused on making forecast outputs understandable and explorable in a collaborative challenge setting; does not represent a solo-built or operationally deployed system.")
    project(doc, "Computer Vision Image Search", "2025", "Python, YOLOv11, Streamlit", "Built an end-to-end visual-retrieval workflow that detects objects in image collections, converts detections into a searchable label index, matches text queries, ranks results, and presents retrieved images in an interactive interface.", nid, secondary="Designed the pipeline as separate detection, indexing, query-matching, ranking, and presentation stages, making detector coverage and ambiguous-label limitations explicit.")
    project(doc, "Conversational RAG Application", "2025", "Streamlit, LangGraph, Hugging Face, Groq", "Developed a multi-turn, document-grounded assistant with explicit retrieval and generation stages, embedding-based search, maintained conversation state, and an interface for inspecting grounded responses.", nid, secondary="Used LangGraph state to keep retrieval and response generation modular while Groq inference supplied the language-model layer.")
    project(doc, "Driver Drowsiness Detection", "2024", "OpenCV, NumPy, TensorFlow/Keras", "Created a real-time camera prototype that detects face and eye regions, interprets visual signals, and triggers alerts; optimized the frame-processing path while documenting that the prototype is not a certified safety system.", nid, "https://github.com/ChetanSrikant/Drowsiness-Detection-system", secondary="Combined traditional frame processing with learned inference to demonstrate an end-to-end camera-to-alert workflow.")
    project(doc, "Detection & Segmentation Experiments", "2024–2025", "PyTorch, YOLOv11, Detectron2, Faster R-CNN, U-Net", "Implemented notebook-based experiments in custom object detection, instance segmentation, Faster R-CNN, Detectron2, and U-Net segmentation, with emphasis on dataset preparation, inference inspection, and model limitations.", nid)
    project(doc, "Digital Image Processing Laboratory", "2023–2025", "OpenCV, NumPy, Python", "Implemented enhancement, CLAHE and histogram equalization, denoising and filtering, color thresholding, affine and perspective transforms, contours, edge detection, morphology, region processing, resizing, and segmentation in reproducible notebooks.", nid)

    section_heading(doc, "Selected Product & Full-Stack Projects")
    project(doc, "ZAP Ride-Hailing Platform", "2025", "React, Express, MongoDB, JWT", "Built an end-to-end ride-booking product covering account flows, vehicle selection, trip requests, protected routes, and persistent backend data through a React client and Express API.", nid, "https://github.com/ChetanSrikant/Zap")
    project(doc, "LOOP Real-Time Chat", "2024", "React, Firebase, React Router", "Developed an authenticated messaging application with shared state, real-time conversations, route-based navigation, and media support using Firebase services.", nid, "https://github.com/ChetanSrikant/Loop")
    project(doc, "Identifying Creditworthy Borrowers", "2023", "scikit-learn, Streamlit, NumPy", "Created a classification workflow that prepares borrower data, generates creditworthiness predictions, and exposes results through a review-oriented Streamlit interface.", nid, "https://github.com/ChetanSrikant/Identifying_Creditworthy_Borrowers")

    section_heading(doc, "Additional Technical Breadth")
    p = doc.add_paragraph(style="CV Body")
    spacing(p, after=0.5)
    font(p.add_run(
        "Additional academic and exploratory work includes radar-threat classification, medical-image classification, "
        "eye segmentation, stereo-depth estimation, sentiment analysis, and voice-driven ordering prototypes. These are "
        "presented as notebook experiments rather than production deployments."
    ), 9.0)
    p = doc.add_paragraph(style="CV Body")
    font(p.add_run("Public code portfolio: "), 9.0, bold=True, color=NAVY)
    hyperlink(p, "github.com/ChetanSrikant", "https://github.com/ChetanSrikant", size=9.0)

    props = doc.core_properties
    props.title = "Chetan Srikant Mandiga — Full Curriculum Vitae"
    props.subject = "Software engineering, applied AI, computer vision, and full-stack experience"
    props.author = "Chetan Srikant Mandiga"
    props.keywords = "Python, Computer Vision, OpenCV, Applied AI, Full Stack, Azure AD, Active Directory"
    doc.save(OUT)
    print(OUT)


if __name__ == "__main__":
    build()
