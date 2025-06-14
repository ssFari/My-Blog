// Penjelasan kode:
// 1. Event listener DOMContentLoaded digunakan agar kode JS berjalan setelah seluruh elemen HTML termuat.
// 2. Semua querySelector disimpan di variabel agar tidak query DOM berulang-ulang (lebih efisien).
// 3. Event wheel pada categoryList agar user bisa scroll kategori secara horizontal dengan mouse.
//    e.preventDefault() mencegah scroll vertikal default, { passive: false } agar preventDefault bisa dijalankan.
// 4. currentLayout menyimpan mode tampilan (list/grid) berdasarkan icon yang aktif saat halaman dimuat.
// 5. renderArticles: Memfilter dan menampilkan artikel sesuai kategori dan layout aktif. Gunakan .map().join("") agar render efisien.
//    Class layout diubah sesuai currentLayout.
// 6. renderCategories: Membuat ulang daftar kategori, menandai kategori aktif, lalu memanggil renderArticles.
// 7. Event hashchange: Saat user klik kategori (hash berubah), renderCategories dipanggil agar tampilan sesuai kategori.
// 8. Event click pada categoryIcons: Mengubah layout (list/grid) dan class icon yang aktif, lalu render ulang artikel.
// 9. renderCategories() dipanggil saat inisialisasi agar tampilan langsung muncul saat halaman dimuat.
// 10. categoryTabs dan ArticleData adalah data statis untuk kategori dan artikel.

// Enable horizontal scroll on mouse wheel for category tabs
window.addEventListener("DOMContentLoaded", function () {
    // Wait for DOM to load
    // Simpan referensi DOM
    const categoryList = document.querySelector(
        ".category-tabs .category-list .category-items"
    );
    const categoryIcons = document.querySelector(
        ".category-tabs .category-list .category-icons"
    );
    const listIcon = document.querySelector(
        ".category-tabs .category-list .category-icons .list-icon"
    );
    const gridIcon = document.querySelector(
        ".category-tabs .category-list .category-icons .grid-icon"
    );
    const articleLayout = document.querySelector("#articleLayout");

    // Horizontal scroll kategori
    if (categoryList) {
        categoryList.addEventListener(
            "wheel",
            function (e) {
                if (e.deltaY !== 0) {
                    e.preventDefault();
                    categoryList.scrollLeft += e.deltaY;
                }
            },
            { passive: false }
        );
    }

    // Layout toggle
    let currentLayout =
        gridIcon && gridIcon.classList.contains("active") ? "grid" : "list";
    let currentPage = 1;
    const articlesPerPage = 6; // Default articles per page

    function renderArticles(category) {
        if (!articleLayout) return;

        const currentHash = window.location.hash || "#All"; // Default to "All"
        const currentCategory = currentHash.replace("#", ""); // Get current category from hash
        // Filter articles based on category
        const filteredArticles =
            currentCategory === "All"
                ? ArticleData
                : ArticleData.filter(
                      (article) => article.category === currentCategory
                  );

        // Paginate logic
        const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
        if (currentPage > totalPages) currentPage = totalPages || 1; // Reset to last page if currentPage exceeds total
        const startIndex = (currentPage - 1) * articlesPerPage; // Calculate start index for pagination
        const endIndex = startIndex + articlesPerPage; // Calculate start and end index for pagination
        const pagedArticles = filteredArticles.slice(startIndex, endIndex); // Get articles for current page

        // Render articles
        articleLayout.innerHTML = pagedArticles
            .map(
                (article) => `
            <a href="${article.url}">
        <div class="article-card ${
            currentLayout === "list" ? "article-card-row" : "article-card-col"
        }">
            <div class="card-image">
                <img src="${article.img}" alt="${article.title}" />
            </div>
            <div class="card-content">
                <h3 class="card-title">${article.title}</h3>
                <p class="card-desc">${article.desc}</p>
                <div class="card-meta">
                    <span class="card-date">${article.date}</span>
                    <span class="card-dot">&bull;</span>
                    <span class="card-category">${article.category}</span>
                </div>
            </div>
        </div>
    </a>
`
            )
            .join("");

        // Set layout class
        articleLayout.classList.toggle(
            "article-grid-col",
            currentLayout === "list"
        );
        articleLayout.classList.toggle(
            "article-grid-row",
            currentLayout === "grid"
        );

        // Render pagination controls
        renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
        const relatedArticles = document.querySelector(".related-articles"); // Assuming this is the pagination container
        if (!relatedArticles) return; // Check if relatedArticles exists
        relatedArticles.innerHTML = ""; // Clear previous pagination
        for (let i = 1; i <= totalPages; i++) {
            relatedArticles.innerHTML += `<li class="related-article${
                i === currentPage ? " active" : ""
            }">
                <a href="#" class="related-link" data-page="${i}">${i}</a>
            </li>
        `;
        }

        // add event listeners to pagination links
        const prevLink = document.querySelector(".preview-link");
        const nextLink = document.querySelector(".next-link");
        if (prevLink) {
            prevLink.href = "#" + (currentPage - 1);
            prevLink.classList.toggle("disabled", currentPage === 1); // Disable prev link if on first page
        }
        if (nextLink) {
            nextLink.href = "#";
            nextLink.classList.toggle("disabled", currentPage === totalPages); // Disable next link if on last page
        }
    }

    // Pagination click event
    this.document.addEventListener("click", function (e) {
        if (e.target.classList.contains("related-link")) {
            e.preventDefault();
            const page = parseInt(e.target.getAttribute("data-page"));
            if (!isNaN(page)) {
                currentPage = page; // Update current page
                renderArticles();
                scrollToArticle(); // Re-render articles for new page
            }
        } else if (e.target.classList.contains("preview-link")) {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage--; // Decrement current page
                renderArticles();
                scrollToArticle(); // Re-render articles for new page
            }
        } else if (e.target.classList.contains("next-link")) {
            e.preventDefault();
            const currentHash = window.location.hash || "#All"; // Default to "All"
            const currentCategory = currentHash.replace("#", ""); // Get current category from hash
            const filteredArticles =
                currentCategory === "All"
                    ? ArticleData
                    : ArticleData.filter(
                          (article) => article.category === currentCategory
                      );
            const totalPages = Math.ceil(
                filteredArticles.length / articlesPerPage
            );
            if (currentPage < totalPages) {
                currentPage++; // Increment current page
                renderArticles();
                scrollToArticle(); // Re-render articles for new page
            }
        }
    });

    function scrollToArticle() {
        const articleLayout = document.querySelector("#articleLayout");
        if (articleLayout) {
            articleLayout.scrollIntoView({ behavior: "smooth" });
        }
    }

    function renderCategories() {
        const categoryItems = document.querySelector(".category-items");
        if (!categoryItems) return;
        const categories = categoryTabs[0].category;
        const currentHash = window.location.hash || "#All";
        categoryItems.innerHTML = categories
            .map((cat) => {
                const hash = `#${cat}`;
                return `<li class="category-item"><a${
                    currentHash === hash ? ' class="active"' : ""
                } href="${hash}">${cat}</a></li>`;
            })
            .join("");
        currentPage = 1; // Reset page on category change
        renderArticles();
    }

    // Event listener untuk kategori
    window.addEventListener("hashchange", renderCategories);

    // Event listener untuk icon layout
    if (categoryIcons) {
        categoryIcons.addEventListener("click", function (e) {
            if (e.target.closest(".list-icon")) {
                currentLayout = "grid";
                gridIcon && gridIcon.classList.add("active");
                listIcon && listIcon.classList.remove("active");
                renderArticles();
            } else if (e.target.closest(".grid-icon")) {
                currentLayout = "list";
                listIcon && listIcon.classList.add("active");
                gridIcon && gridIcon.classList.remove("active");
                renderArticles();
            }
        });
    }

    // Inisialisasi
    renderCategories();

    // Inisialisasi Quill
    const toolbarOptions = [
        ["bold", "italic", "underline", "strike"], // toggled buttons
        ["blockquote", "code-block"],
        ["link", "image", "video", "formula"],

        [{ header: 1 }, { header: 2 }], // custom button values
        [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
        [{ script: "sub" }, { script: "super" }], // superscript/subscript
        [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
        [{ direction: "rtl" }], // text direction

        [{ size: ["small", false, "large", "huge"] }], // custom dropdown
        [{ header: [1, 2, 3, 4, 5, 6, false] }],

        [{ color: [] }, { background: [] }], // dropdown with defaults from theme
        [{ font: [] }],
        [{ align: [] }],

        ["clean"], // remove formatting button
    ];

    const quill = new Quill("#quill-editor", {
        theme: "snow",
        modules: {
            syntax: {
                highlight: (text) => hljs.highlightAuto(text).value,
            }, // Aktifkan syntax highlighting bawaan Quill
            toolbar: toolbarOptions,
        },
    });

    quill.on("text-change", () => {
        const codeBlocks = document.querySelectorAll("pre code");
        codeBlocks.forEach((block) => {
            hljs.highlightElement(block);
        });
    });

    // Fungsi agar konten editor masuk ke input tersembunyi sebelum submit
    function prepareContent() {
        const html = quill.root.innerHTML;
        document.getElementById("content").value = html;
        return true; // lanjut submit
    }

    function updateImagePreview() {
        const input = document.getElementById("featuredImageInput");
        const previewContainer = document.getElementById("imagePreview");
        if (!input || !previewContainer) return;
        let preview = previewContainer.querySelector("img");
        if (!preview) {
            // If <img> does not exist, create it
            preview = document.createElement("img");
            preview.style.display = "none";
            previewContainer.appendChild(preview);
        }
        // Always hide the preview initially
        preview.style.display = "none";
        const url = input.value.trim();

        if (url) {
            preview.src = url;
            preview.alt = "Image preview";
            preview.style.display = "block";
            previewContainer.style.display = "block"; // Show the container
        } else {
            preview.src = "";
            preview.alt = "";
            previewContainer.style.display = "none"; // Hide the container if no URL
            // preview.style.display = "none"; // Already hidden above
        }
    }

    // Ensure compatibility with CreatePost.html
    document
        .getElementById("featuredImageInput")
        .addEventListener("input", updateImagePreview);

    const removeImg = document.getElementById("removeImage");
    removeImg.addEventListener("click", function () {
        const input = document.getElementById("featuredImageInput");
        const previewContainer = document.getElementById("imagePreview");
        if (input) {
            input.value = ""; // Clear the input value
        }
        if (previewContainer) {
            previewContainer.innerHTML = ""; // Clear the preview container
            previewContainer.style.display = "none"; // Hide the container
        }
    });
});

// Function to generate Navbar component
function createNavbar() {
    const navbar = document.createElement("nav");
    navbar.className = "navbar";

    const navbarContent = document.createElement("div");
    navbarContent.className = "navbar-content";

    const logo = document.createElement("div");
    logo.className = "logo";
    const logoImg = document.createElement("img");
    logoImg.id = "logo-img";
    logoImg.className = "logo-img";
    // Dynamically set logo image source based on current path
    // If current path includes '/pages/', use relative path to root
    if (window.location.pathname.endsWith("/CreatePost.html")) {
        logoImg.src = "../../Public/Assets/Logo.png";
    } else {
        logoImg.src = "Public/Assets/Logo.png";
    }
    const logoLink = document.createElement("a");
    logoLink.href = "/";
    logoLink.textContent = "writings.dev";
    logo.appendChild(logoImg);
    logo.appendChild(logoLink);

    const navLinks = document.createElement("div");
    navLinks.className = "nav-links";
    const navList = document.createElement("ul");
    navList.className = "nav-list";
    const navItem = document.createElement("li");
    const navLink = document.createElement("a");
    navLink.href = "/pages/about";
    navLink.textContent = "about me";
    navItem.appendChild(navLink);
    navList.appendChild(navItem);
    navLinks.appendChild(navList);

    navbarContent.appendChild(logo);
    navbarContent.appendChild(navLinks);
    navbar.appendChild(navbarContent);

    return navbar;
}

// Only append navbar if #navbar-container exists and DOM is loaded

// Function to generate Footer component
function createFooter() {
    const footerContent = document.createElement("div");
    footerContent.className = "footer-content";

    const footerLogo = document.createElement("div");
    footerLogo.className = "footer-logo";
    const logoImg = document.createElement("img");
    logoImg.id = "logo-img";
    logoImg.className = "footer-logo-img";
    if (window.location.pathname.endsWith("/CreatePost.html")) {
        logoImg.src = "../../Public/Assets/Logo.png";
    } else {
        logoImg.src = "Public/Assets/Logo.png";
    } // Set the footer logo image source
    const logoLink = document.createElement("a");
    logoLink.href = "#";
    logoLink.textContent = "writings.dev";
    footerLogo.appendChild(logoImg);
    footerLogo.appendChild(logoLink);

    const footerDetails = document.createElement("div");
    footerDetails.className = "footer-details";

    const footerMe = document.createElement("div");
    footerMe.className = "footer-me";
    const footerText = document.createElement("p");
    footerText.className = "footer-text";
    footerText.innerHTML =
        'created by: <a href="http://github.com/ssFari">ssFari</a>';

    const footerSocials = document.createElement("div");
    footerSocials.className = "footer-socials";
    const socialLinks = [
        { href: "http://github.com/ssFari", icon: "fa-brands fa-github" },
        {
            href: "https://www.instagram.com/_luthfi_punya/",
            icon: "fa-brands fa-instagram",
        },
        {
            href: "https://www.linkedin.com/in/safari-luthfi-4ba665248/",
            icon: "fa-brands fa-linkedin",
        },
        { href: "https://x.com/SafariLuthfi1", icon: "fa-brands fa-x-twitter" },
    ];
    socialLinks.forEach(({ href, icon }) => {
        const socialLink = document.createElement("a");
        socialLink.className = "footer-icon";
        socialLink.href = href;
        const socialIcon = document.createElement("i");
        socialIcon.className = icon;
        socialLink.appendChild(socialIcon);
        footerSocials.appendChild(socialLink);
    });

    footerMe.appendChild(footerText);
    footerMe.appendChild(footerSocials);

    const footerCopyright = document.createElement("p");
    footerCopyright.className = "footer-text";
    footerCopyright.textContent =
        "©design by: @kamranahmedse | All rights reserved.";

    footerDetails.appendChild(footerMe);
    footerDetails.appendChild(footerCopyright);

    footerContent.appendChild(footerLogo);
    footerContent.appendChild(footerDetails);

    return footerContent;
}

// Function to generate Favicon component
function createFavicon() {
    const faviconLink = document.createElement("link");
    faviconLink.rel = "icon";
    faviconLink.type = "image/x-icon";
    if (window.location.pathname.endsWith("/CreatePost.html")) {
        faviconLink.href = "../../Public/Assets/logo.png"; // Relative path for pages
    } else {
        faviconLink.href = "Public/Assets/logo.png"; // Relative path for root
    }
    const fontAwesomeCSS = document.createElement("link");
    fontAwesomeCSS.rel = "stylesheet";
    fontAwesomeCSS.href =
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.css";
    fontAwesomeCSS.integrity =
        "sha512-GmZYQ9SKTnOea030Tbiat0Y+jhnYLIpsGAe6QTnToi8hI2nNbVMETHeK4wm4MuYMQdrc38x+sX77+kVD01eNsQ==";
    fontAwesomeCSS.crossOrigin = "anonymous";
    fontAwesomeCSS.referrerPolicy = "no-referrer";

    const indexCSS = document.createElement("link");
    indexCSS.rel = "stylesheet";
    if (window.location.pathname.endsWith("/CreatePost.html")) {
        indexCSS.href = "../../index.css"; // Relative path for pages
    } else {
        indexCSS.href = "index.css";
    }

    const fontAwesomeJS = document.createElement("script");
    fontAwesomeJS.src =
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/js/all.js";
    fontAwesomeJS.integrity =
        "sha512-Nxw1drpjN57DlFRzn8h+RaS7dTjhPOlHftsKYGRkCEj1lEbx3k1bqNz1qvLpRkEF19qe7YSHppCdnLc8FUmfnQ==";
    fontAwesomeJS.crossOrigin = "anonymous";
    fontAwesomeJS.referrerPolicy = "no-referrer";

    return [faviconLink, fontAwesomeCSS, indexCSS, fontAwesomeJS];
}

document.addEventListener("DOMContentLoaded", function () {
    const navbarContainer = document.getElementById("navbar-container");
    if (navbarContainer) {
        navbarContainer.appendChild(createNavbar());
    }
    const footerContainer = document.getElementById("footer-container");
    if (footerContainer) {
        footerContainer.appendChild(createFooter());
    }

    // Append favicon and styles to <head> on DOMContentLoaded
    const head = document.head;
    if (head) {
        const faviconElements = createFavicon();
        faviconElements.forEach((el) => head.appendChild(el));
    }
});

const categoryTabs = [
    {
        category: [
            "All",
            "DevOps",
            "JavaScript",
            "Cloud",
            "Scalability",
            "Explainers",
            "AI",
            "Architecture",
        ],
    },
];

const ArticleData = [
    {
        img: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80",
        title: "Getting Started with DevOps",
        desc: "An introduction to DevOps practices and tools for modern software development.",
        url: "#",
        category: "DevOps",
        date: "June 24, 2022",
    },
    {
        img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80",
        title: "Mastering JavaScript ES6+",
        desc: "Deep dive into modern JavaScript features and best practices.",
        url: "#",
        category: "JavaScript",
        date: "July 2, 2022",
    },
    {
        img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
        title: "Cloud Computing Essentials",
        desc: "Understand the basics of cloud computing and popular cloud platforms.",
        url: "#",
        category: "Cloud",
        date: "July 15, 2022",
    },
    {
        img: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
        title: "Building Scalable Applications",
        desc: "Learn strategies and patterns for scaling your applications efficiently.",
        url: "#",
        category: "Scalability",
        date: "August 1, 2022",
    },
    {
        img: "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80",
        title: "Tech Explainers: Simplifying Complex Topics",
        desc: "Clear explanations of complex technology concepts for everyone.",
        url: "#",
        category: "Explainers",
        date: "August 10, 2022",
    },
    {
        img: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
        title: "AI in Everyday Life",
        desc: "Explore how artificial intelligence is transforming industries and daily life.",
        url: "#",
        category: "AI",
        date: "August 20, 2022",
    },
    {
        img: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
        title: "Software Architecture Fundamentals",
        desc: "A guide to software architecture principles and design patterns.",
        url: "#",
        category: "Architecture",
        date: "September 1, 2022",
    },
    {
        img: "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&w=400&q=80",
        title: "Continuous Integration Best Practices",
        desc: "How to set up and maintain effective CI pipelines.",
        url: "#",
        category: "DevOps",
        date: "September 10, 2022",
    },
    {
        img: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&w=400&q=80",
        title: "Async/Await in JavaScript",
        desc: "Simplifying asynchronous code with modern JavaScript.",
        url: "#",
        category: "JavaScript",
        date: "September 15, 2022",
    },
    {
        img: "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&w=400&q=80",
        title: "Cloud Security Basics",
        desc: "Best practices for securing your cloud infrastructure.",
        url: "#",
        category: "Cloud",
        date: "September 20, 2022",
    },
    {
        img: "https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg?auto=compress&w=400&q=80",
        title: "Scaling Databases",
        desc: "Techniques for scaling databases in large applications.",
        url: "#",
        category: "Scalability",
        date: "September 25, 2022",
    },
    {
        img: "https://images.pexels.com/photos/3861973/pexels-photo-3861973.jpeg?auto=compress&w=400&q=80",
        title: "Explaining REST APIs",
        desc: "A beginner's guide to RESTful API concepts.",
        url: "#",
        category: "Explainers",
        date: "October 1, 2022",
    },
    {
        img: "https://images.pexels.com/photos/3861974/pexels-photo-3861974.jpeg?auto=compress&w=400&q=80",
        title: "AI for Image Recognition",
        desc: "How AI is used to recognize images and objects.",
        url: "#",
        category: "AI",
        date: "October 5, 2022",
    },
    {
        img: "https://images.pexels.com/photos/3861975/pexels-photo-3861975.jpeg?auto=compress&w=400&q=80",
        title: "Microservices Architecture",
        desc: "Understanding the microservices approach in software design.",
        url: "#",
        category: "Architecture",
        date: "October 10, 2022",
    },
    {
        img: "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80",
        title: "DevOps for Startups",
        desc: "How small teams can benefit from DevOps culture.",
        url: "#",
        category: "DevOps",
        date: "October 15, 2022",
    },
    {
        img: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
        title: "JavaScript Design Patterns",
        desc: "Reusable solutions for common JavaScript problems.",
        url: "#",
        category: "JavaScript",
        date: "October 20, 2022",
    },
    {
        img: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80",
        title: "Cloud Cost Optimization",
        desc: "Tips to reduce your cloud spending.",
        url: "#",
        category: "Cloud",
        date: "October 25, 2022",
    },
    {
        img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80",
        title: "Scaling Frontend Apps",
        desc: "How to scale frontend applications for millions of users.",
        url: "#",
        category: "Scalability",
        date: "November 1, 2022",
    },
    {
        img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
        title: "Explaining OAuth 2.0",
        desc: "A simple explanation of OAuth 2.0 for beginners.",
        url: "#",
        category: "Explainers",
        date: "November 5, 2022",
    },
    {
        img: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
        title: "AI in Healthcare",
        desc: "How AI is revolutionizing the healthcare industry.",
        url: "#",
        category: "AI",
        date: "November 10, 2022",
    },
    {
        img: "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&w=400&q=80",
        title: "Event-Driven Architecture",
        desc: "Building scalable systems with event-driven design.",
        url: "#",
        category: "Architecture",
        date: "November 15, 2022",
    },
    {
        img: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&w=400&q=80",
        title: "DevOps Automation Tools",
        desc: "Popular tools for automating DevOps workflows.",
        url: "#",
        category: "DevOps",
        date: "November 20, 2022",
    },
    {
        img: "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&w=400&q=80",
        title: "JavaScript Testing Frameworks",
        desc: "Comparing the most popular JS testing tools.",
        url: "#",
        category: "JavaScript",
        date: "November 25, 2022",
    },
    {
        img: "https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg?auto=compress&w=400&q=80",
        title: "Cloud Migration Strategies",
        desc: "How to move your workloads to the cloud.",
        url: "#",
        category: "Cloud",
        date: "December 1, 2022",
    },
    {
        img: "https://images.pexels.com/photos/3861973/pexels-photo-3861973.jpeg?auto=compress&w=400&q=80",
        title: "Scaling with Kubernetes",
        desc: "Using Kubernetes for application scalability.",
        url: "#",
        category: "Scalability",
        date: "December 5, 2022",
    },
    {
        img: "https://images.pexels.com/photos/3861974/pexels-photo-3861974.jpeg?auto=compress&w=400&q=80",
        title: "Explaining GraphQL",
        desc: "What is GraphQL and why use it?",
        url: "#",
        category: "Explainers",
        date: "December 10, 2022",
    },
    {
        img: "https://images.pexels.com/photos/3861975/pexels-photo-3861975.jpeg?auto=compress&w=400&q=80",
        title: "AI for Text Analysis",
        desc: "Natural language processing with AI.",
        url: "#",
        category: "AI",
        date: "December 15, 2022",
    },
    {
        img: "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80",
        title: "Clean Architecture Principles",
        desc: "How to keep your codebase maintainable.",
        url: "#",
        category: "Architecture",
        date: "December 20, 2022",
    },
    {
        img: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
        title: "DevOps Metrics That Matter",
        desc: "Key metrics to track in your DevOps pipeline.",
        url: "#",
        category: "DevOps",
        date: "December 25, 2022",
    },
    {
        img: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80",
        title: "JavaScript for Beginners",
        desc: "A quick start guide for new JavaScript developers.",
        url: "#",
        category: "JavaScript",
        date: "January 1, 2023",
    },
    {
        img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80",
        title: "Cloud Native Applications",
        desc: "Building apps designed for the cloud from day one.",
        url: "#",
        category: "Cloud",
        date: "January 5, 2023",
    },
    {
        img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
        title: "Scalability Myths Busted",
        desc: "Common misconceptions about scaling software.",
        url: "#",
        category: "Scalability",
        date: "January 10, 2023",
    },
    {
        img: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
        title: "Explaining Serverless",
        desc: "What is serverless and when should you use it?",
        url: "#",
        category: "Explainers",
        date: "January 15, 2023",
    },
    {
        img: "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80",
        title: "AI for Developers",
        desc: "How developers can leverage AI in their projects.",
        url: "#",
        category: "AI",
        date: "January 20, 2023",
    },
    {
        img: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
        title: "Modern Architecture Trends",
        desc: "What's new in software architecture for 2023?",
        url: "#",
        category: "Architecture",
        date: "January 25, 2023",
    },
];
