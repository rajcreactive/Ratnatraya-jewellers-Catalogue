let products = [];

const WHATSAPP_NUMBER = "918905650030";
let currentProduct = null;

async function loadProducts() {

    try {

        const response =
            await fetch("data/products.json");

        products =
            await response.json();

        products.sort((a, b) =>
            (a.id || "").localeCompare(
                b.id || ""
            )
        );

        populateCategories();

        buildCategoryCards();

        renderFeaturedProducts();

        renderProducts();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to load products.json"
        );
    }
}

function populateCategories() {

    const select =
        document.getElementById(
            "categoryFilter"
        );

    if (!select) return;

    select.innerHTML =
        `<option value="">
            All Collections
        </option>`;

    const categories =
        [...new Set(
            products
                .filter(p =>
                    p.category &&
                    p.category.toLowerCase() !== "logos" &&
                    p.category.toLowerCase() !== "uncategorized"
                )
                .map(p => p.category)
        )];

    categories.sort();

    categories.forEach(category => {

        select.innerHTML += `
        <option value="${category}">
            ${category}
        </option>`;
    });
}

function buildCategoryCards() {

    const container =
        document.getElementById(
            "categoryCards"
        );

    if (!container) return;

    container.innerHTML = "";

    const categories =
        [...new Set(
            products
                .filter(p =>
                    p.category &&
                    p.category.toLowerCase() !== "logos" &&
                    p.category.toLowerCase() !== "uncategorized"
                )
                .map(p => p.category)
        )];

    categories.sort();

    categories.forEach(category => {

        const sample =
            products.find(
                p => p.category === category
            );

        const image =
            getPrimaryImage(sample);

        container.innerHTML += `
        <div
            class="category-card"
            onclick="filterCategory('${category}')">

            <img
                src="${image}"
                alt="${category}">

            <h3>
                ${category}
            </h3>

        </div>`;
    });
}

function filterCategory(category) {

    document.getElementById(
        "categoryFilter"
    ).value = category;

    renderProducts();

    document.getElementById(
        "productGrid"
    ).scrollIntoView({
        behavior: "smooth"
    });
}

function renderFeaturedProducts() {

    const container =
        document.getElementById(
            "featuredGrid"
        );

    if (!container) return;

    container.innerHTML = "";

    const shownIds =
        new Set();

    products.forEach(product => {

        const category =
            (product.category || "")
            .toLowerCase();

        if (!product.featured)
            return;

        if (
            category === "logos" ||
            category === "uncategorized"
        )
            return;

        if (
            shownIds.has(product.id)
        )
            return;

        shownIds.add(product.id);

        container.innerHTML +=
            buildCard(product);
    });
}

function renderProducts() {

    const grid =
        document.getElementById(
            "productGrid"
        );

    if (!grid) return;

    const search =
        document
        .getElementById("searchBox")
        .value
        .toLowerCase();

    const category =
        document
        .getElementById("categoryFilter")
        .value;

    grid.innerHTML = "";

    let count = 0;

    const shownIds =
        new Set();

    products.forEach(product => {

        const productCategory =
            (product.category || "")
            .toLowerCase();

        if (
            productCategory === "logos" ||
            productCategory === "uncategorized"
        ) {
            return;
        }

        if (
            shownIds.has(product.id)
        ) {
            return;
        }

        const name =
            (product.name || "")
            .toLowerCase();

        if (
            search &&
            !name.includes(search)
        ) {
            return;
        }

        if (
            category &&
            product.category !== category
        ) {
            return;
        }

        shownIds.add(product.id);

        count++;

        grid.innerHTML +=
            buildCard(product);
    });

    const counter =
        document.getElementById(
            "productCount"
        );

    if (counter) {

        counter.innerText =
            count + " Products Found";
    }
}

function buildCard(product) {

    const image =
        getPrimaryImage(product);

    const badge =
        product.featured
        ? `
        <div class="featured-badge">
            ★ Featured
        </div>`
        : "";

    return `
    <div
        class="product-card"
        onclick="openProductModal('${product.id}')">

        ${badge}

        <img
            src="${image}"
            alt="${product.name || ''}"
            loading="lazy">

        <div class="product-info">

            <h3>
                ${product.name || ""}
            </h3>

            <p>
                ${product.id || ""}
            </p>

            <p>
                ${product.category || ""}
            </p>

        </div>

    </div>`;
}

function getPrimaryImage(product) {

    if (!product)
        return "assets/no-image.png";

    if (
        product.images &&
        product.images.length > 0
    ) {
        return product.images[0];
    }

    if (product.mainImage) {
        return product.mainImage;
    }

    return "assets/no-image.png";
}

function openProductModal(productId) {

    const product =
        products.find(
            p => p.id === productId
        );

    if (!product) return;

    currentProduct =
        product;

    const images =
        product.images &&
        product.images.length
            ? product.images
            : [getPrimaryImage(product)];

    document.getElementById(
        "modalTitle"
    ).innerText =
        product.name || "";

    document.getElementById(
        "modalCode"
    ).innerText =
        product.id || "";

    document.getElementById(
        "modalCategory"
    ).innerText =
        product.category || "";

    const mainImage =
        document.getElementById(
            "modalMainImage"
        );

    mainImage.src =
        images[0];

    const thumbs =
        document.getElementById(
            "thumbnailContainer"
        );

    thumbs.innerHTML = "";

    images.forEach(image => {

        const thumb =
            document.createElement("img");

        thumb.src = image;

        thumb.onclick =
            function () {

                mainImage.src = image;
            };

        thumbs.appendChild(thumb);
    });

    const message =
        encodeURIComponent(
            `Hello, I am interested in ${product.name} (${product.id}).`
        );

    document.getElementById(
        "whatsappButton"
    ).href =
        `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

    document.getElementById(
        "productModal"
    ).style.display =
        "block";

    document.body.style.overflow =
        "hidden";
}

function closeProductModal() {

    document.getElementById(
        "productModal"
    ).style.display =
        "none";

    document.body.style.overflow =
        "auto";
}

document.getElementById?.("searchButton")?.addEventListener(
    "click",
    renderProducts
);

document.addEventListener(
    "input",
    function(event) {

        if (
            event.target.id ===
            "searchBox"
        ) {
            renderProducts();
        }
    }
);

document.addEventListener(
    "change",
    function(event) {

        if (
            event.target.id ===
            "categoryFilter"
        ) {
            renderProducts();
        }
    }
);

window.addEventListener(
    "click",
    function(event) {

        const modal =
            document.getElementById(
                "productModal"
            );

        if (
            event.target === modal
        ) {
            closeProductModal();
        }
    }
);

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape"
        ) {
            closeProductModal();
        }
    }
);

loadProducts();

function shareCurrentProduct() {

    if (!currentProduct) {
        alert("No product selected");
        return;
    }

    const text =
`✨ Ratna Traya Jewellers

${currentProduct.name}

Product Code: ${currentProduct.code}

Category: ${currentProduct.category}

View Catalogue:
${window.location.href}`;

    const whatsappUrl =
        `https://wa.me/?text=${encodeURIComponent(text)}`;

    window.open(whatsappUrl, "_blank");
}
