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
OUT = ROOT / "output" / "cv" / "Chetan_Srikant_Mandiga_Traditional_CV.docx"
FONT = "Arial"
BLACK = RGBColor(0, 0, 0)
GRAY = RGBColor(75, 75, 75)
LINK = RGBColor(5, 63, 105)


def set_font(run, size=9.3, bold=False, italic=False, color=BLACK):
    run.font.name = FONT
    rfonts = run._element.get_or_add_rPr().get_or_add_rFonts()
    rfonts.set(qn("w:ascii"), FONT)
    rfonts.set(qn("w:hAnsi"), FONT)
    run.font.size = Pt(size)
    run.bold = bold
    run.italic = italic
    run.font.color.rgb = color


def set_spacing(p, before=0, after=0, line=1.0):
    fmt = p.paragraph_format
    fmt.space_before = Pt(before)
    fmt.space_after = Pt(after)
    fmt.line_spacing_rule = WD_LINE_SPACING.SINGLE
    fmt.line_spacing = line


def add_link(p, text, url, size=9.0):
    rel_id = p.part.relate_to(url, RT.HYPERLINK, is_external=True)
    link = OxmlElement("w:hyperlink")
    link.set(qn("r:id"), rel_id)
    run = OxmlElement("w:r")
    rpr = OxmlElement("w:rPr")
    rf = OxmlElement("w:rFonts")
    rf.set(qn("w:ascii"), FONT)
    rf.set(qn("w:hAnsi"), FONT)
    color = OxmlElement("w:color")
    color.set(qn("w:val"), "053F69")
    sz = OxmlElement("w:sz")
    sz.set(qn("w:val"), str(int(size * 2)))
    rpr.extend([rf, color, sz])
    run.append(rpr)
    text_el = OxmlElement("w:t")
    text_el.text = text
    run.append(text_el)
    link.append(run)
    p._p.append(link)


def add_rule(p):
    ppr = p._p.get_or_add_pPr()
    bdr = OxmlElement("w:pBdr")
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), "5")
    bottom.set(qn("w:space"), "2")
    bottom.set(qn("w:color"), "000000")
    bdr.append(bottom)
    ppr.append(bdr)


def make_bullets(doc):
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
    for tag, value in (("w:start", "1"), ("w:numFmt", "bullet"), ("w:lvlText", "•"), ("w:lvlJc", "left")):
        el = OxmlElement(tag)
        el.set(qn("w:val"), value)
        lvl.append(el)
    ppr = OxmlElement("w:pPr")
    tabs = OxmlElement("w:tabs")
    tab = OxmlElement("w:tab")
    tab.set(qn("w:val"), "num")
    tab.set(qn("w:pos"), "540")
    tabs.append(tab)
    ind = OxmlElement("w:ind")
    ind.set(qn("w:left"), "540")
    ind.set(qn("w:hanging"), "270")
    ppr.extend([tabs, ind])
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


def section(doc, title):
    p = doc.add_paragraph(style="CV Section")
    p.paragraph_format.keep_with_next = True
    set_font(p.add_run(title.upper()), 10.2, bold=True)
    add_rule(p)


def paragraph(doc, text, size=9.3, after=0):
    p = doc.add_paragraph(style="CV Body")
    set_spacing(p, after=after)
    set_font(p.add_run(text), size)
    return p


def bullet(doc, text, nid, size=9.15):
    p = doc.add_paragraph(style="CV Bullet")
    apply_bullet(p, nid)
    p.paragraph_format.keep_together = True
    set_font(p.add_run(text), size)


def entry(doc, title, date, subtitle=None, location=None):
    p = doc.add_paragraph(style="CV Entry")
    p.paragraph_format.keep_with_next = True
    p.paragraph_format.tab_stops.add_tab_stop(Inches(7.0), WD_TAB_ALIGNMENT.RIGHT)
    set_font(p.add_run(title), 9.45, bold=True)
    set_font(p.add_run("\t" + date), 9.1, bold=True)
    if subtitle:
        s = doc.add_paragraph(style="CV Subentry")
        s.paragraph_format.keep_with_next = True
        s.paragraph_format.tab_stops.add_tab_stop(Inches(7.0), WD_TAB_ALIGNMENT.RIGHT)
        set_font(s.add_run(subtitle), 9.1, italic=True, color=GRAY)
        if location:
            set_font(s.add_run("\t" + location), 9.0, italic=True, color=GRAY)


def skill_line(doc, label, value):
    p = doc.add_paragraph(style="CV Body")
    set_spacing(p, after=0.5)
    set_font(p.add_run(label + ": "), 9.15, bold=True)
    set_font(p.add_run(value), 9.15)


def project(doc, title, year, stack, bullets, nid, url=None):
    p = doc.add_paragraph(style="CV Entry")
    p.paragraph_format.keep_with_next = True
    p.paragraph_format.tab_stops.add_tab_stop(Inches(7.0), WD_TAB_ALIGNMENT.RIGHT)
    if url:
        add_link(p, title, url, size=9.45)
    else:
        set_font(p.add_run(title), 9.45, bold=True)
    set_font(p.add_run(" | " + stack), 8.85, italic=True, color=GRAY)
    set_font(p.add_run("\t" + year), 9.0, bold=True)
    for item in bullets:
        bullet(doc, item, nid, size=9.05)


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc = Document()
    sec = doc.sections[0]
    sec.start_type = WD_SECTION.NEW_PAGE
    sec.page_width, sec.page_height = Inches(8.5), Inches(11)
    # compact_reference_guide with a named traditional-CV geometry override.
    sec.top_margin = Inches(0.58)
    sec.bottom_margin = Inches(0.55)
    sec.left_margin = Inches(0.68)
    sec.right_margin = Inches(0.68)
    sec.header_distance = Inches(0.3)
    sec.footer_distance = Inches(0.3)

    styles = doc.styles
    normal = styles["Normal"]
    normal.font.name = FONT
    normal._element.rPr.rFonts.set(qn("w:ascii"), FONT)
    normal._element.rPr.rFonts.set(qn("w:hAnsi"), FONT)
    normal.font.size = Pt(9.3)
    normal.font.color.rgb = BLACK
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
    styles["CV Section"].paragraph_format.space_before = Pt(6)
    styles["CV Section"].paragraph_format.space_after = Pt(3)
    styles["CV Entry"].paragraph_format.space_before = Pt(2)
    styles["CV Subentry"].paragraph_format.space_after = Pt(0.5)
    styles["CV Bullet"].paragraph_format.space_after = Pt(1.5)
    nid = make_bullets(doc)

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_spacing(p, after=2)
    set_font(p.add_run("CHETAN SRIKANT MANDIGA"), 17.5, bold=True)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_spacing(p, after=1)
    set_font(p.add_run("+91 9989714684  |  Hyderabad, Telangana, India"), 9.2)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_spacing(p, after=3)
    add_link(p, "chetansrikantmandiga@gmail.com", "mailto:chetansrikantmandiga@gmail.com", 9.0)
    set_font(p.add_run("  |  "), 9.0)
    add_link(p, "LinkedIn/Chetan-Srikant", "https://www.linkedin.com/in/chetan-srikant-mandiga-514784248/", 9.0)
    set_font(p.add_run("  |  "), 9.0)
    add_link(p, "GitHub/ChetanSrikant", "https://github.com/ChetanSrikant", 9.0)

    section(doc, "Objective")
    paragraph(doc, "Systems Engineer with hands-on experience in Active Directory, Azure AD, and enterprise identity systems, supported by a strong foundation in applied AI, computer vision, full-stack development, and data platforms. Experienced in building AI-backed applications and supporting production infrastructure. Interested in AI systems engineering, scalable platforms, computer vision, and cloud-based AI deployment.", 9.2)

    section(doc, "Education")
    entry(doc, "B.Tech in Computer Science and Engineering, BML Munjal University", "2021 - 2025")
    entry(doc, "Minor in Entrepreneurship, BML Munjal University", "2023 - 2025")

    section(doc, "Skills")
    skill_line(doc, "Languages", "Python, Java, C++, JavaScript")
    skill_line(doc, "AI, ML & Computer Vision", "NumPy, Pandas, scikit-learn, PyTorch, TensorFlow/Keras, OpenCV, YOLOv11, U-Net, Detectron2, Faster R-CNN")
    skill_line(doc, "Web & Frameworks", "React.js, Node.js, Express, Next.js, Streamlit, LangGraph")
    skill_line(doc, "Databases & Platforms", "MongoDB, MySQL, Firebase, Active Directory, Azure AD")
    skill_line(doc, "Tools & Concepts", "Git, REST APIs, Hugging Face embeddings, Groq, DSA, OOP, feature engineering, forecasting, system-design fundamentals")

    section(doc, "Experience")
    entry(doc, "Systems Engineer - IAM Cloud (Active Directory / Azure AD)", "Aug 2025 - Present", "HCLTech", "Noida, India")
    bullet(doc, "Manage Active Directory and Azure AD environments supporting user provisioning, access control, and hybrid-identity integration in an enterprise setup.", nid)
    bullet(doc, "Troubleshoot authentication failures, account lockouts, directory synchronization, and access issues to maintain reliable production identity services.", nid)
    bullet(doc, "Support incident ownership, operational documentation, and coordination across enterprise teams.", nid)

    entry(doc, "Full Stack Data Scientist", "Mar 2025 - Aug 2025", "Innomatics Research Labs", "Hyderabad, India")
    bullet(doc, "Developed two AI-driven data platforms: an enterprise forecasting dashboard for a private client and a public-transport demand analysis system for TGSRTC.", nid)
    bullet(doc, "Built interactive dashboards that connected forecasting models and a custom chatbot to stakeholder-facing workflows, applying CRISP-ML(Q) and Git-based delivery practices.", nid)
    bullet(doc, "Contributed substantially to the application and visualization layer of the winning Telangana AI Rising / AI4TG transport solution.", nid)

    entry(doc, "Project Intern", "May 2023 - Jul 2023", "DRDO - Defence Research and Development Organisation", "Hyderabad, India")
    bullet(doc, "Designed and implemented Python/Tkinter interfaces for device communication over the RS-422 protocol.", nid)
    bullet(doc, "Streamlined operator workflows and reduced communication errors during testing.", nid)

    p = doc.add_paragraph()
    p.add_run().add_break(WD_BREAK.PAGE)

    section(doc, "Projects")
    project(doc, "TGSRTC Public Transport Demand Platform", "2025", "Forecasting, dashboards, decision support", [
        "Contributed to the web application that surfaced public-transport demand forecasts through visual exploration and stakeholder-oriented interpretation.",
        "Worked as part of the team that won the AI4TG Grand Challenge; the project is presented as a collaborative solution rather than a solo deployment."
    ], nid)
    project(doc, "Computer Vision Image Search", "2025", "Python, YOLOv11, Streamlit", [
        "Built a visual-retrieval pipeline that detects objects in image collections, creates a searchable label index, matches text queries, ranks results, and displays retrieved images.",
        "Separated detection, indexing, query matching, ranking, and presentation so detector-coverage and ambiguous-label limitations could be inspected."
    ], nid)
    project(doc, "Conversational RAG Application", "2025", "Streamlit, LangGraph, Hugging Face, Groq", [
        "Developed a multi-turn, document-grounded assistant with embedding-based retrieval, explicit retrieval and generation stages, maintained conversation state, and Groq inference."
    ], nid)
    project(doc, "ZAP - Ride-Hailing Platform", "2025", "React, Express, MongoDB, JWT", [
        "Built a full-stack ride-booking product covering account flows, vehicle selection, trip requests, protected routes, and persistent backend data."
    ], nid, "https://github.com/ChetanSrikant/Zap")
    project(doc, "Driver Drowsiness Detection System", "2024", "Python, OpenCV, NumPy, TensorFlow/Keras", [
        "Developed a real-time camera prototype that detects face and eye regions, interprets visual signals, and triggers fatigue alerts.",
        "Optimized the camera-to-alert processing flow while documenting that it is a prototype rather than a certified automotive safety system."
    ], nid, "https://github.com/ChetanSrikant/Drowsiness-Detection-system")
    project(doc, "LOOP Chat App - Real-Time Messaging Platform", "2024", "React, Firebase, React Router", [
        "Engineered an authenticated messaging application with real-time conversations, shared state, route-based navigation, and media support."
    ], nid, "https://github.com/ChetanSrikant/Loop")
    project(doc, "Identifying Creditworthy Borrowers", "2023", "scikit-learn, Streamlit, NumPy", [
        "Built a classification workflow that prepares borrower data, generates creditworthiness predictions, and presents review-ready results through Streamlit."
    ], nid, "https://github.com/ChetanSrikant/Identifying_Creditworthy_Borrowers")
    project(doc, "Image Processing and Segmentation Experiments", "2023 - 2025", "OpenCV, PyTorch, YOLOv11, U-Net, Detectron2", [
        "Implemented enhancement, histogram equalization, filtering, thresholding, transforms, contours, morphology, edge detection, detection, and segmentation in reproducible notebooks."
    ], nid)

    section(doc, "Extra-Curricular Activities & Recognition")
    bullet(doc, "Winner, AI4TG Grand Challenge / Telangana AI Rising: contributed to an AI solution for improving public-transport utilization (team recognition).", nid)
    paragraph(doc, "Additional exploratory work includes radar-threat classification, medical-image classification, eye segmentation, stereo-depth estimation, sentiment analysis, and voice-driven ordering prototypes.", 9.05)

    props = doc.core_properties
    props.title = "Chetan Srikant Mandiga - Curriculum Vitae"
    props.subject = "Traditional one-column curriculum vitae"
    props.author = "Chetan Srikant Mandiga"
    props.keywords = "Systems Engineer, Applied AI, Computer Vision, Full Stack, Azure AD, Active Directory"
    doc.save(OUT)
    print(OUT)


if __name__ == "__main__":
    build()
