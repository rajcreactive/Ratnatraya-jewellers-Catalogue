console.log("RTJ V19 Loaded");

let products = [];
let categories = [];
let editIndex = -1;

window.onload = async function () {

    await loadProducts();

    buildCategories();

    populateCategoryDropdown();

    populateCategoryFilter();

    renderCategories();

    renderCategoryAnalytics();

    renderProducts();
};

async function loadProducts() {

    try {

        const response =
            await fetch("../data/products.json")

        products =
            await response.json();

        products.sort((a,b) => {

            if(a.featured && !b.featured) return -1;
            if(!a.featured && b.featured) return 1;

            return (a.name || "")
                .localeCompare(
                    b.name || ""
                );
        });

    } catch(error){

        console.error(error);

        alert("Unable to load products");
    }
}

function buildCategories(){

    categories = [];

    products.forEach(product => {

        const cat =
            product.category ||
            "uncategorized";

        if(!categories.includes(cat)){

            categories.push(cat);
        }
    });

    categories.sort();
}

function populateCategoryDropdown(){

    const dropdown =
        document.getElementById(
            "productCategory"
        );

    if(!dropdown) return;

    dropdown.innerHTML = "";

    categories.forEach(cat => {

        dropdown.innerHTML +=
        `<option value="${cat}">
            ${cat}
        </option>`;
    });
}

function populateCategoryFilter(){

    const filter =
        document.getElementById(
            "categoryFilter"
        );

    if(!filter) return;

    filter.innerHTML =
    `<option value="">
        All Categories
    </option>`;

    categories.forEach(cat => {

        filter.innerHTML +=
        `<option value="${cat}">
            ${cat}
        </option>`;
    });
}

function renderCategories(){

    const table =
        document.getElementById(
            "categoryTable"
        );

    if(!table) return;

    table.innerHTML = "";

    categories.forEach(cat => {

        table.innerHTML +=
        `<tr>
            <td>${cat}</td>
            <td>Active</td>
        </tr>`;
    });
}

function updateStatistics(showingCount){

    const statTotal =
        document.getElementById("statTotal");

    const statShowing =
        document.getElementById("statShowing");

    const statCategory =
        document.getElementById("statCategory");

    const statFeatured =
        document.getElementById("statFeatured");

    const statHealth =
        document.getElementById("statHealth");

    const statMissingImages =
        document.getElementById("statMissingImages");

    const statMissingCategories =
        document.getElementById("statMissingCategories");

    const statMissingNames =
        document.getElementById("statMissingNames");

    if(!statTotal) return;

    statTotal.innerText =
        products.length;

    statShowing.innerText =
        showingCount;

    statCategory.innerText =
        document.getElementById(
            "categoryFilter"
        ).value || "All";

    statFeatured.innerText =
        products.filter(
            p => p.featured
        ).length;

    const missingImages =
        products.filter(
            p => !p.mainImage
        ).length;

    const missingCategories =
        products.filter(
            p =>
                !p.category ||
                p.category === "uncategorized"
        ).length;

    const missingNames =
        products.filter(
            p => !p.name
        ).length;

    if(statMissingImages){
        statMissingImages.innerText =
            missingImages;
    }

    if(statMissingCategories){
        statMissingCategories.innerText =
            missingCategories;
    }

    if(statMissingNames){
        statMissingNames.innerText =
            missingNames;
    }

    const healthy =
        products.filter(
            p =>
                p.name &&
                p.mainImage &&
                p.category &&
                p.category !== "uncategorized"
        ).length;

    const health =
        Math.round(
            (healthy / products.length) * 100
        );

    statHealth.innerText =
        health + "%";
}

function renderCategoryAnalytics(){

    const container =
        document.getElementById(
            "categoryAnalytics"
        );

    if(!container) return;

    container.innerHTML = "";

    const counts = {};

    products.forEach(product => {

        const cat =
            product.category ||
            "uncategorized";

        counts[cat] =
            (counts[cat] || 0) + 1;
    });

    Object.keys(counts)
        .sort()
        .forEach(cat => {

            container.innerHTML += `
            <div class="analytics-card">

                <div class="analytics-name">
                    ${cat}
                </div>

                <div class="analytics-count">
                    ${counts[cat]}
                </div>

            </div>`;
        });
}

function renderProducts(){

    const table =
        document.getElementById(
            "productTable"
        );

    if(!table) return;

    table.innerHTML = "";

    const search =
        document
        .getElementById("searchBox")
        .value
        .toLowerCase();

    const selectedCategory =
        document
        .getElementById("categoryFilter")
        .value;

    let showingCount = 0;

    products.forEach((product,index) => {

        const id =
            product.id || "";

        const name =
            product.name || "";

        const category =
            product.category || "";

        if(
            search &&
            !id.toLowerCase().includes(search) &&
            !name.toLowerCase().includes(search)
        ){
            return;
        }

        if(
            selectedCategory &&
            category !== selectedCategory
        ){
            return;
        }

        showingCount++;

        const imageHtml =
            product.mainImage
            ? `<img src="${product.mainImage}" class="product-thumb">`
            : "📷";

        const featuredHtml =
            product.featured
            ? `<span class="featured-star">★ Featured</span>`
            : "-";

        table.innerHTML +=
        `<tr>
            <td>${imageHtml}</td>
            <td>${id}</td>
            <td>${name}</td>
            <td>${category}</td>
            <td>${featuredHtml}</td>
            <td>
                <button onclick="editProduct(${index})">
                    Edit
                </button>
            </td>
        </tr>`;
    });

    document.getElementById(
        "totalProducts"
    ).innerText =
        products.length;

    const cards =
        document.querySelectorAll(".card p");

    if(cards.length >= 3){

        cards[1].innerText =
            categories.length;

        cards[2].innerText =
            products.filter(
                p => p.featured
            ).length;
    }

    updateStatistics(
        showingCount
    );
}

function editProduct(index){

    editIndex = index;

    const product =
        products[index];

    document.getElementById(
        "productCode"
    ).value =
        product.id || "";

    document.getElementById(
        "productName"
    ).value =
        product.name || "";

    document.getElementById(
        "productImage"
    ).value =
        product.mainImage || "";

    document.getElementById(
        "featured"
    ).checked =
        product.featured || false;

    document.getElementById(
        "productCategory"
    ).value =
        product.category || "";

    const preview =
        document.getElementById(
            "imagePreview"
        );

    if(preview){

        preview.src =
            product.mainImage || "";
    }

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });
}

async function saveProduct(){

    if(editIndex === -1){

        alert("Select product first");
        return;
    }

    const product =
        products[editIndex];

    const payload = {

        name:
            document.getElementById(
                "productName"
            ).value,

        category:
            document.getElementById(
                "productCategory"
            ).value,

        featured:
            document.getElementById(
                "featured"
            ).checked,

        mainImage:
            document.getElementById(
                "productImage"
            ).value
    };

    try{

        const response =
            await fetch(
                `/api/product/${product.id}`,
                {
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json"
                    },
                    body:JSON.stringify(payload)
                }
            );

        const result =
            await response.json();

        if(result.success){

            alert(
                "Product Saved Successfully"
            );

            await loadProducts();

            buildCategories();

            populateCategoryDropdown();

            populateCategoryFilter();

            renderCategories();

            renderCategoryAnalytics();

            renderProducts();
        }

    }catch(error){

        console.error(error);

        alert("Save Failed");
    }
}

function exportCatalogue(){

    window.open(
        "/api/products",
        "_blank"
    );
}
