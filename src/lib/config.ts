
export const siteConfig = {
  name: "Ashish Kumar",
  surname: "Panda",
  tagline: "CAT — Coder | Artist | Traveler",
  intro: "MSCS student at UC San Diego. AI Engineer building the future of intelligent systems through computer vision and agentic architectures.",
  subheadline: "Engineering Intelligence.",
  accentColor: "#FF8000",
  socials: {
    github: "https://github.com/Ashindustry007",
    linkedin: "https://linkedin.com/in/ashishkumar-panda",
    instagram: "https://instagram.com/ashish.panda"
  },
  skills: [
    { id: "#01", label: "AI & Machine Learning" },
    { id: "#02", label: "Computer Vision & LLMs" },
    { id: "#03", label: "Agentic AI & Systems" },
    { id: "#04", label: "Software Engineering" }
  ],
  framesCount: 192,
  framesBaseUrl: "https://uobfpmgknyqxdsdvqcfe.supabase.co/storage/v1/object/public/Webp%20Sequence/frame_",
  framesSuffix: "_delay-0.042s.png"
};

export const experience = [
  {
    title: "AI Research Intern",
    company: "Boolean Lab - UCSD Health",
    description: "Engineered self-supervised PyTorch pipelines for colon tissue analysis using Spatial Transcriptomics. Fine-tuned DINOv3-7B Transformers using LoRA, reducing memory by 75% while achieving 81% mIoU in tissue segmentation."
  },
  {
    title: "Software Engineer",
    company: "Open Financial Technologies",
    description: "Deployed Multi-modal AI models boosting extraction accuracy by 18% for automated invoice conversion (92% success). Engineered secure fintech solutions protecting 50K+ users with RBI-compliant risk controls."
  },
  {
    title: "Deep Learning Research Intern",
    company: "Pucho Digital Healthcare",
    description: "Accelerated mRNA vaccine screening via deep learning pipelines. Implemented Explainable AI (XAI) for cell anomaly detection in MRI scans, achieving 96.55% sensitivity for clinical decision support."
  },
  {
    title: "Data Science Intern",
    company: "Analytics Labs",
    description: "Designed hybrid deep learning models for COVID-19 spread prediction with 89% forecast accuracy. Mitigated financial fraud using Genetic Algorithms and Scikit-Learn (98.5% recall)."
  }
];

export const projects = [
  {
    title: "Diabetic Retinopathy Segmentation",
    description: "Developed a Residual U-Net model for early detection of diabetic retinopathy, achieving an AUC of 0.9667 using Python, Keras, and OpenCV.",
    imageKey: "project-retinal"
  },
  {
    title: "Vocal Bio-Marker AI",
    description: "Created a hybrid CRNN-Attention model for non-invasive COVID-19 screening with 97% accuracy using spectral feature extraction and Bidirectional LSTMs.",
    imageKey: "project-vocal"
  },
  {
    title: "Population Growth Deep Learning",
    description: "Built a deep learning pipeline to predict exponential growth rates from genetic data, benchmarking ANNs against Deep Transformer and MultiTask Learning architectures.",
    imageKey: "project-population"
  }
];

export const publications = [
  {
    title: "Odia Handwritten Numeral Recognition: A Hybrid Modelling Approach",
    authors: "A. K. Panda, S. Dash, A. Kuanar, D. Behera and B. Panda",
    conference: "2021 5th International Conference on Electronics, Communication and Aerospace Technology (ICECA)",
    doi: "10.1109/ICECA52323.2021.9675980"
  }
];

export const academicData = {
  university: "Odisha University of Technology and Research (OUTR)",
  degree: "Bachelor of Technology (B.Tech)",
  branch: "Electrical Engineering",
  cgpa: "9.40",
  semesters: [
    {
      id: "SE01",
      sgpa: "8.06",
      courses: [
        "Mathematics-I",
        "Physics",
        "Basic Electrical Engineering",
        "Work Shop/Basic Manufacturing Process",
        "Physics Lab"
      ]
    },
    {
      id: "SE02",
      sgpa: "9.85",
      courses: [
        "Chemistry",
        "Mathematics-II",
        "Programming for Problem Solving",
        "English",
        "Engineering Graphics and Design"
      ]
    },
    {
      id: "SE03",
      sgpa: "9.63",
      courses: [
        "Mathematics-III",
        "Engineering Economics",
        "Electrical Circuit Analysis",
        "Electrical Machines-I",
        "Analog Electronic Circuit"
      ]
    },
    {
      id: "SE04",
      sgpa: "9.71",
      courses: [
        "Signal and Systems",
        "Organizational Behaviour",
        "Electrical Machines-II",
        "Measurement Techniques",
        "Digital System Design"
      ]
    },
    {
      id: "SE05",
      sgpa: "9.80",
      courses: [
        "Artificial Intelligence",
        "Power Transmission and Distribution",
        "Power Electronics",
        "Control System-I",
        "Microprocessor and Microcontroller"
      ]
    },
    {
      id: "SE06",
      sgpa: "9.68",
      courses: [
        "Object Oriented Programming with C++",
        "Power System Operation and Control",
        "Digital Signal Processing",
        "Renewable Energy Systems",
        "Design and Simulation Lab"
      ]
    },
    {
      id: "SE07",
      sgpa: "9.10",
      courses: [
        "Machine Learning",
        "Power System Protection & Switchgear",
        "Control Systems-II",
        "Power Quality and Custom Power Devices",
        "Minor Project Course"
      ]
    },
    {
      id: "SE08",
      sgpa: "9.06",
      courses: [
        "Project Course",
        "Comprehensive Viva Voce"
      ]
    }
  ]
};
