export const BAA_CONTENT = `BUSINESS ASSOCIATE AGREEMENT

Between:

Covered Entity: _____________________________ ("Covered Entity")
Business Associate: Zynthr, operated by Ardexa LLC ("Business Associate")

Effective Date: _____________________________

RECITALS

WHEREAS, Covered Entity is a healthcare provider subject to the Health Insurance Portability and Accountability Act of 1996, as amended ("HIPAA"), and the regulations promulgated thereunder, including the Standards for Privacy of Individually Identifiable Health Information (the "Privacy Rule") and the Security Standards for the Protection of Electronic Protected Health Information (the "Security Rule"), codified at 45 CFR Parts 160 and 164;

WHEREAS, Business Associate provides an AI-powered practice management and operations platform ("the Platform") that may involve the creation, receipt, maintenance, or transmission of Protected Health Information ("PHI") on behalf of Covered Entity;

WHEREAS, the parties wish to comply with the requirements of HIPAA, the Health Information Technology for Economic and Clinical Health Act of 2009 ("HITECH Act"), and any applicable state privacy laws;

NOW, THEREFORE, in consideration of the mutual promises and covenants contained herein, the parties agree as follows:

1. DEFINITIONS

1.1 Terms used but not otherwise defined in this Agreement shall have the same meaning as those terms in 45 CFR Parts 160 and 164.

1.2 "Protected Health Information" or "PHI" means any information, whether oral or recorded in any form or medium, that: (a) relates to the past, present, or future physical or mental health or condition of an individual; the provision of health care to an individual; or the past, present, or future payment for the provision of health care to an individual; and (b) identifies the individual or with respect to which there is a reasonable basis to believe the information can be used to identify the individual.

1.3 "Electronic Protected Health Information" or "ePHI" means PHI that is transmitted or maintained in electronic media.

1.4 "Breach" means the acquisition, access, use, or disclosure of PHI in a manner not permitted under the Privacy Rule which compromises the security or privacy of the PHI, as defined in 45 CFR 164.402.

1.5 "Security Incident" means the attempted or successful unauthorized access, use, disclosure, modification, or destruction of information or interference with system operations in an information system, as defined in 45 CFR 164.304.

2. OBLIGATIONS OF BUSINESS ASSOCIATE

2.1 Permitted Uses and Disclosures. Business Associate shall not use or disclose PHI other than as permitted or required by this Agreement or as required by law. Business Associate shall use PHI solely to provide the Platform services described in the underlying service agreement between the parties.

2.2 Safeguards. Business Associate shall implement and maintain appropriate administrative, physical, and technical safeguards to prevent the use or disclosure of PHI other than as provided for by this Agreement. Business Associate shall comply with the Security Rule requirements applicable to business associates, including but not limited to:

(a) Encryption of ePHI at rest and in transit using AES-256 or equivalent;
(b) Role-based access controls limiting access to PHI to authorized personnel and systems only;
(c) Audit logging of all access to PHI;
(d) Automatic session timeout after 15 minutes of inactivity;
(e) Multi-tenant data isolation ensuring each Covered Entity PHI is logically separated;
(f) Regular security assessments and vulnerability testing.

2.3 Reporting. Business Associate shall report to Covered Entity any use or disclosure of PHI not provided for by this Agreement, any Breach of Unsecured PHI, and any Security Incident of which it becomes aware, without unreasonable delay and in no case later than sixty (60) calendar days after discovery of such event.

2.4 Breach Notification. In the event of a Breach of Unsecured PHI, Business Associate shall:

(a) Notify Covered Entity within thirty (30) calendar days of discovery;
(b) Provide the identity of each individual whose PHI has been, or is reasonably believed to have been, accessed, acquired, used, or disclosed;
(c) Provide a description of the nature of the Breach;
(d) Provide a description of the types of PHI involved;
(e) Provide recommended steps individuals should take to protect themselves;
(f) Provide a description of what Business Associate is doing to investigate, mitigate, and prevent future Breaches.

2.5 Subcontractors. Business Associate shall ensure that any subcontractor or agent to whom it provides PHI agrees in writing to the same restrictions, conditions, and requirements that apply to Business Associate under this Agreement. Business Associate current subcontractors who may have access to ePHI include:

- Supabase, Inc. (Database hosting) - BAA Required
- Anthropic, PBC (AI model provider) - BAA Required
- OpenAI, Inc. (AI model provider) - BAA Required
- Amazon Web Services (Cloud infrastructure) - BAA Required (if applicable)

2.6 Access to PHI. Business Associate shall make PHI available to Covered Entity or an individual as necessary to satisfy Covered Entity obligations under 45 CFR 164.524 (individual right of access).

2.7 Amendment of PHI. Business Associate shall make PHI available for amendment and incorporate amendments as necessary to satisfy Covered Entity obligations under 45 CFR 164.526.

2.8 Accounting of Disclosures. Business Associate shall make available the information required to provide an accounting of disclosures as necessary to satisfy Covered Entity obligations under 45 CFR 164.528.

2.9 Availability of Books and Records. Business Associate shall make its internal practices, books, and records relating to the use and disclosure of PHI available to the Secretary of Health and Human Services for purposes of determining compliance with the HIPAA Rules.

2.10 Minimum Necessary. Business Associate shall request, use, and disclose only the minimum amount of PHI necessary to accomplish the purpose of the request, use, or disclosure.

2.11 De-identification. Business Associate shall not de-identify PHI or create limited data sets from PHI except as expressly authorized by Covered Entity in writing.

2.12 No Sale of PHI. Business Associate shall not directly or indirectly receive remuneration in exchange for any PHI unless permitted by the HITECH Act.

2.13 AI-Specific Provisions.

(a) PHI processed by AI models shall not be used to train, fine-tune, or improve any AI model without express written consent from Covered Entity;
(b) AI model providers used by Business Associate must contractually commit to not retaining or training on PHI;
(c) Business Associate shall maintain logging of all AI model interactions that involve PHI;
(d) AI-generated outputs containing PHI shall be subject to the same access controls as source PHI.

3. OBLIGATIONS OF COVERED ENTITY

3.1 Covered Entity shall notify Business Associate of any limitations in its notice of privacy practices in accordance with 45 CFR 164.520, to the extent that such limitation may affect Business Associate use or disclosure of PHI.

3.2 Covered Entity shall notify Business Associate of any changes in, or revocation of, permission by an individual to use or disclose PHI, to the extent that such changes may affect Business Associate use or disclosure of PHI.

3.3 Covered Entity shall notify Business Associate of any restriction to the use or disclosure of PHI that Covered Entity has agreed to in accordance with 45 CFR 164.522, to the extent that such restriction may affect Business Associate use or disclosure of PHI.

3.4 Covered Entity shall not request Business Associate to use or disclose PHI in any manner that would not be permissible under HIPAA if done by Covered Entity.

4. TERM AND TERMINATION

4.1 Term. This Agreement shall be effective as of the Effective Date and shall terminate when all PHI provided by Covered Entity to Business Associate, or created or received by Business Associate on behalf of Covered Entity, is destroyed or returned to Covered Entity.

4.2 Termination for Cause. Either party may terminate this Agreement if it determines that the other party has violated a material term of this Agreement. The non-breaching party shall provide written notice to the breaching party and allow thirty (30) days to cure the breach. If the breach is not cured within such period, the non-breaching party may terminate this Agreement.

4.3 Effect of Termination. Upon termination of this Agreement, Business Associate shall:

(a) Return or destroy all PHI received from Covered Entity or created or received by Business Associate on behalf of Covered Entity, within thirty (30) days;
(b) Retain no copies of PHI except as required by law;
(c) If return or destruction is not feasible, extend the protections of this Agreement to the retained PHI and limit further uses and disclosures to the purposes that make return or destruction infeasible.

5. MISCELLANEOUS

5.1 Regulatory References. A reference in this Agreement to a section in the HIPAA Rules means the section as in effect or as amended.

5.2 Amendment. The parties agree to take such action as is necessary to amend this Agreement from time to time for compliance with HIPAA and the HITECH Act.

5.3 Survival. The respective rights and obligations of Business Associate under Section 4.3 shall survive the termination of this Agreement.

5.4 Interpretation. Any ambiguity in this Agreement shall be resolved to permit compliance with the HIPAA Rules.

5.5 Governing Law. This Agreement shall be governed by federal HIPAA regulations and the laws of the State of Florida.

5.6 Entire Agreement. This Agreement constitutes the entire agreement between the parties with respect to the subject matter hereof and supersedes all prior agreements and understandings, both written and oral.

This Business Associate Agreement is provided as a template. Covered Entity and Business Associate should consult with legal counsel to ensure compliance with all applicable federal and state laws.`
