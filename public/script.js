let currentCategory = "Барлығы";


async function loadProducts() {

    const search =
        document.getElementById("search").value;

    const response = await fetch(
        "/api/products?search=" +
        encodeURIComponent(search)
    );

    const products = await response.json();

    let result = products;

    if (currentCategory !== "Барлығы") {

        result = products.filter(
            product =>
                product.category === currentCategory
        );

    }

    displayProducts(result);
}


function displayProducts(products) {

    const container =
        document.getElementById("productsList");

    if (products.length === 0) {

        container.innerHTML = `
            <div class="empty">

                <h3>
                    Тауар табылмады
                </h3>

                <p>
                    Басқа тауар іздеп көріңіз.
                </p>

            </div>
        `;

        return;
    }


    container.innerHTML =
        products.map(product => {

            let icon = "📦";

            if (product.category === "Техника") {
                icon = "💻";
            }

            if (product.category === "Кітап") {
                icon = "📚";
            }

            if (product.category === "Киім") {
                icon = "👕";
            }

            if (
                product.category ===
                "Оқу құралдары"
            ) {
                icon = "✏️";
            }


            return `

                <div class="product-card">

                    <div class="product-image">
                        ${icon}
                    </div>

                    <div class="product-body">

                        <div class="product-category">
                            ${product.category}
                        </div>

                        <div class="product-name">
                            ${product.name}
                        </div>

                        <div class="product-description">
                            ${product.description}
                        </div>

                        <div class="product-bottom">

                            <div class="price">
                                ${product.price.toLocaleString("kk-KZ")} ₸
                            </div>

                            <button
                                class="view-button"
                                onclick="showProduct(${product.id})"
                            >
                                Көру
                            </button>

                        </div>

                    </div>

                </div>

            `;

        }).join("");
}


function filterCategory(category) {

    currentCategory = category;

    loadProducts();
}


async function showProduct(id) {

    const response =
        await fetch("/api/products");

    const products =
        await response.json();

    const product =
        products.find(
            item => item.id === id
        );

    if (!product) {
        return;
    }


    document.getElementById(
        "modalContent"
    ).innerHTML = `

        <div class="product-category">
            ${product.category}
        </div>

        <h2>
            ${product.name}
        </h2>

        <p>
            <strong>Бағасы:</strong>
            ${product.price.toLocaleString("kk-KZ")} ₸
        </p>

        <p>
            <strong>Сипаттама:</strong>
            ${product.description || "Жоқ"}
        </p>

        <p>
            <strong>Сатушы:</strong>
            ${product.seller}
        </p>

        <p>
            <strong>Телефон:</strong>
            ${product.phone || "Көрсетілмеген"}
        </p>

        ${
            product.phone
            ?
            `
                <a
                    class="contact-button"
                    href="tel:${product.phone}"
                >
                    📞 Сатушыға қоңырау шалу
                </a>
            `
            :
            ""
        }

    `;


    document.getElementById(
        "modal"
    ).style.display = "flex";
}


function closeModal() {

    document.getElementById(
        "modal"
    ).style.display = "none";
}


document.getElementById(
    "productForm"
).addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const product = {

            name:
                document.getElementById(
                    "name"
                ).value,

            price:
                document.getElementById(
                    "price"
                ).value,

            category:
                document.getElementById(
                    "category"
                ).value,

            seller:
                document.getElementById(
                    "seller"
                ).value,

            phone:
                document.getElementById(
                    "phone"
                ).value,

            description:
                document.getElementById(
                    "description"
                ).value

        };


        const response =
            await fetch(
                "/api/products",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(product)
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(data.message);

            return;
        }


        alert(
            "Тауар сәтті жарияланды!"
        );


        this.reset();


        loadProducts();


        document.getElementById(
            "products"
        ).scrollIntoView({
            behavior: "smooth"
        });

    }
);


window.onclick = function(event) {

    const modal =
        document.getElementById("modal");

    if (event.target === modal) {
        closeModal();
    }

};


loadProducts();