import { Router } from "express"
import student from "../../models/Student.js"
import teacher from "../../models/Teacher.js"
import generator from "../../utils/id_generator.js"
import bcrypt from "bcryptjs"


const signup_router = Router()

signup_router.post("/signup/student/", async (req, res) => {

    const id = generator()
    const hashed_password = await bcrypt.hash(req.body.password, 10)

    const grade_num = req.body.grade === "jss1" ? 1 :
        req.body.grade === "jss2" ? 2 :
            req.body.grade === "jss3" ? 3 :
                req.body.grade === "sss1" ? 4 :
                    req.body.grade === "sss2" ? 5 :
                        req.body.grade === "sss3" ? 6 : null


    const dep_code = req.body.department === "Science" ?
        "SCI" : req.body.department === "Commercial" ?
            "COM" : req.body.department === "ART" ?
                "ART" : null

    await student.auth.add(
        id,
        req.body.name,
        req.body.email,
        hashed_password,
        req.body.dateOfBirth,
        req.body.stateOfOrigin,
        req.body.sex,
        req.body.previousAddress,
        req.body.currentAddress,
        req.body.bloodGroup,
        req.body.genotype,
        req.body.height,
        req.body.weight,
        req.body.disability,
        req.body.parentGuardianType,
        req.body.parentGuardianPhone,
        req.body.parentGuardianEmail,
        req.body.parentGuardianAddress
    )

    await (req.body.studentType === "junior" ?
        student.auth.junior.add(id, grade_num) :
        student.auth.senior.add(id, req.body.role, dep_code, grade_num)
    )

    res.status(201).json({
        message: "Student registered successfully",
        studentId: id
    })
})

signup_router.post("/signup/teacher/", async (req, res) => {

    const id = generator()
    const hashed_password = await bcrypt.hash(req.body.password, 10)

    console.log(req.body)
    _ = {
        name: 'lionel sisso',
        email: 'q@c.c',
        telephone: '+234567809879',
        password: '000000',
        dateOfBirth: '2005-05-24',
        stateOfOrigin: 'Akwa Ibom',
        sex: 'male',
        maritalStatus: 'married',
        previousAddress: 'igj tuhgntu8r',
        currentAddress: 'qwert wueuru',
        bloodGroup: 'A-',
        genotype: 'AS',
        height: 100,
        weight: 30,
        disability: 'visual',
        qualification: 'bsc',
        subjects: [
            'Mathematics',
            'Account',
            'Creative Arts',
            'English Language (JSS)',
            'English Language (SSS)'
        ],
        juniorSubjects: ['Mathematics'],
        seniorSubjects: ['Mathematics', 'Account', 'Creative Arts'],
        juniorEnglishDisciplines: [
            'Structure',
            'Comprehension',
            'Composition',
            'Register',
            'Phonetics'
        ],
        seniorEnglishDisciplines: [
            'Structure',
            'Comprehension',
            'Composition',
            'Register',
            'Phonetics'
        ],
        invitationCode: 'swrt t'
    }


    teacher.auth.add(
        id,
        req.body.name,
        req.body.email,
        req.body.telephone,
        hashed_password,
        req.body.dateOfBirth,
        req.body.stateOfOrigin,
        req.body.sex,
        req.body.previousAddress,
        req.body.currentAddress,
        req.body.maritalStatus,
        req.body.bloodGroup,
        req.body.genotype,
        req.body.height,
        req.body.weight,
        req.body.disability,
        req.body.qualification
    )

    //helper function to store a teacher's subject
    const add_teach_subject_grade = (subject, grade) => {

        if (grade === "j") {
            teacher.auth.add_teach_subject_grade(`${subject}`, 1, id)
            teacher.auth.add_teach_subject_grade(`${subject}`, 2, id)
            teacher.auth.add_teach_subject_grade(`${subject}`, 3, id)

        } else if (grade === "s") {
            teacher.auth.add_teach_subject_grade(`${subject}`, 1, id)
            teacher.auth.add_teach_subject_grade(`${subject}`, 2, id)
            teacher.auth.add_teach_subject_grade(`${subject}`, 3, id)
        }
    }

    const add_teach_discipline_grade = (discipline, grade) => {

        if (grade === "j") {
            teacher.auth.add_teach_discipline_grade(`${discipline}`, 1, id)
            teacher.auth.add_teach_subject_grade(`${discipline}`, 2, id)
            teacher.auth.add_teach_subject_grade(`${discipline}`, 3, id)

        } else if (grade === "s") {
            teacher.auth.add_teach_subject_grade(`${discipline}`, 1, id)
            teacher.auth.add_teach_subject_grade(`${discipline}`, 2, id)
            teacher.auth.add_teach_subject_grade(`${discipline}`, 3, id)
        }
    }

    {
        if (req.body.juniorSubjects.includes("Mathematics")) add_teach_subject_grade("jun_math", "j")
        if (req.body.juniorSubjects.includes("French")) add_teach_subject_grade("jun_fr", "j")
        if (req.body.juniorSubjects.includes("Yoruba")) add_teach_subject_grade("jun_yor", "j")
        if (req.body.juniorSubjects.includes("Basic Technology")) add_teach_subject_grade("jun_btech", "j")
        if (req.body.juniorSubjects.includes("Basic Science")) add_teach_subject_grade("jun_bsci", "j")
        if (req.body.juniorSubjects.includes("Agricultural Science")) add_teach_subject_grade("jun_agric", "j")
        if (req.body.juniorSubjects.includes("Social Studies")) add_teach_subject_grade("jun_sstud", "j")
        if (req.body.juniorSubjects.includes("Literature")) add_teach_subject_grade("jun_lit", "j")
        if (req.body.juniorSubjects.includes("Security Education")) add_teach_subject_grade("jun_sedu", "j")
        if (req.body.juniorSubjects.includes("Civic Education")) add_teach_subject_grade("jun_cedu", "j")
        if (req.body.juniorSubjects.includes("Business Studies")) add_teach_subject_grade("jun_bstud", "j")
        if (req.body.juniorSubjects.includes("Cultural and Creative Arts")) add_teach_subject_grade("jun_cca", "j")
        if (req.body.juniorSubjects.includes("Physical and Health Education")) add_teach_subject_grade("jun_phe", "j")
        if (req.body.juniorSubjects.includes("Home Economics")) add_teach_subject_grade("jun_heco", "j")
        if (req.body.juniorSubjects.includes("Christian Religious Studies")) add_teach_subject_grade("jun_crs", "j")

        if (req.body.seniorSubjects.includes("Mathematics")) add_teach_subject_grade("sen_math", "s")
        if (req.body.seniorSubjects.includes("French")) add_teach_subject_grade("sen_fr", "s")
        if (req.body.seniorSubjects.includes("Yoruba")) add_teach_subject_grade("sen_yor", "s")
        if (req.body.seniorSubjects.includes("Civic Education")) add_teach_subject_grade("sen_cedu", "s")
        if (req.body.seniorSubjects.includes("Data Processing")) add_teach_subject_grade("sen_dpro", "s")
        if (req.body.seniorSubjects.includes("Agricultural Science")) add_teach_subject_grade("sen_agric", "s")
        if (req.body.seniorSubjects.includes("Physics")) add_teach_subject_grade("sen_phy", "s")
        if (req.body.seniorSubjects.includes("Literature")) add_teach_subject_grade("sen_lit", "s")
        if (req.body.seniorSubjects.includes("Chemistry")) add_teach_subject_grade("sen_chem", "s")
        if (req.body.seniorSubjects.includes("Biology")) add_teach_subject_grade("sen_bio", "s")
        if (req.body.seniorSubjects.includes("Further Mathematics")) add_teach_subject_grade("sen_fmath", "s")
        if (req.body.seniorSubjects.includes("Technical Drawing")) add_teach_subject_grade("sen_td", "s")
        if (req.body.seniorSubjects.includes("Account")) add_teach_subject_grade("sen_acc", "s")
        if (req.body.seniorSubjects.includes("Commerce")) add_teach_subject_grade("sen_comm", "s")
        if (req.body.seniorSubjects.includes("Christian Religious Knowledge")) add_teach_subject_grade("sen_crk", "s")
        if (req.body.seniorSubjects.includes("Economics")) add_teach_subject_grade("sen_eco", "s")
        if (req.body.seniorSubjects.includes("Government")) add_teach_subject_grade("sen_gov", "s")
        if (req.body.seniorSubjects.includes("Creative Arts")) add_teach_subject_grade("sen_ca", "s")
        if (req.body.seniorSubjects.includes("Islamic Religious Knowledge")) add_teach_subject_grade("sen_irk", "s")

        if (req.body.juniorSubjects.includes("Structure")) add_teach_discipline_grade("jun_struct", "j")
        if (req.body.juniorSubjects.includes("Composition")) add_teach_discipline_grade("jun_compo", "j")
        if (req.body.juniorSubjects.includes("Comprehension")) add_teach_discipline_grade("jun_compre", "j")
        if (req.body.juniorSubjects.includes("Phonetics")) add_teach_discipline_grade("jun_phon", "j")
        if (req.body.juniorSubjects.includes("Register")) add_teach_discipline_grade("jun_reg", "j")

        if (req.body.seniorSubjects.includes("Structure")) add_teach_discipline_grade("sen_struct", "s")
        if (req.body.seniorSubjects.includes("Composition")) add_teach_discipline_grade("sen_compo", "s")
        if (req.body.seniorSubjects.includes("Comprehension")) add_teach_discipline_grade("sen_compre", "s")
        if (req.body.seniorSubjects.includes("Phonetics")) add_teach_discipline_grade("sen_phon", "s")
        if (req.body.seniorSubjects.includes("Register")) add_teach_discipline_grade("sen_reg", "s")
    }
})

export default signup_router