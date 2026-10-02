let currentCategory = "Барлығы";


function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function(char) {
        const chars = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return chars[char];
    });
}


function scrollToProducts() {
    document.getElementById("products").scrollIntoView({
        behavior: "smooth"
    });
}


function scrollToSell() {
    document.getElementById("sell").scrollIntoView({
        behavior: "smooth"
    });
}


async function loadProducts() {

    const container =
        document.getElementById("productsList");

    const search =
        document.getElementById("search").value.trim();


    container.innerHTML = `
        <div class="empty">
            <h3>Тауарлар жүктелуде...</h3>
        </div>
    `;


    try {

        const response = await fetch(
            "/api/products?search=" +
            encodeURIComponent(search)
        );


        if (!response.ok) {
            throw new Error("Тауарларды жүктеу қатесі");
        }


        const products =
            await response.json();


        let result = products;


        if (currentCategory !== "Барлығы") {

            result = products.filter(
                product =>
                    product.category ===
                    currentCategory
            );
        }


        displayProducts(result);


    } catch (error) {

        console.error(error);

        container.innerHTML = `
            <div class="empty">
                <h3>Тауарлар жүктелмеді</h3>
                <p>
                    Сервер жұмыс істеп тұрғанын тексеріңіз.
                </p>
            </div>
        `;
    }
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
                    Басқа тауар іздеп көріңіз
                    немесе жаңа тауар қосыңыз.
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


            if (product.category === "Басқа") {
                icon = "📦";
            }


            return `
                <article class="product-card">

                    <div class="product-image">
                        <span>${icon}</span>
                    </div>


                    <div class="product-body">

                        <div class="product-category">
                            ${escapeHTML(product.category)}
                        </div>


                        <h3 class="product-name">
                            ${escapeHTML(product.name)}
                        </h3>


                        <p class="product-description">
                            ${escapeHTML(
                                product.description ||
                                "Сипаттама жоқ"
                            )}
                        </p>


                        <div class="product-bottom">

                            <div class="price">
                                ${Number(
                                    product.price
                                ).toLocaleString("kk-KZ")} ₸
                            </div>


                            <button
                                class="view-button"
                                onclick="showProduct(${Number(product.id)})"
                            >
                                Толығырақ
                            </button>

                        </div>

                    </div>

                </article>
            `;

        }).join("");
}


function filterCategory(category) {

    currentCategory = category;


    document
        .querySelectorAll(".category-button")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.category === category
            );

        });


    loadProducts();
}


async function showProduct(id) {

    try {

        const response =
            await fetch("/api/products");


        if (!response.ok) {
            throw new Error();
        }


        const products =
            await response.json();


        const product =
            products.find(
                item =>
                    Number(item.id) ===
                    Number(id)
            );


        if (!product) {

            alert("Тауар табылмады");

            return;
        }


        document.getElementById(
            "modalContent"
        ).innerHTML = `

            <div class="product-category">
                ${escapeHTML(product.category)}
            </div>

            <h2>
                ${escapeHTML(product.name)}
            </h2>

            <p>
                <strong>Бағасы:</strong>
                ${Number(
                    product.price
                ).toLocaleString("kk-KZ")} ₸
            </p>

            <p>
                <strong>Сипаттама:</strong>
                ${escapeHTML(
                    product.description ||
                    "Жоқ"
                )}
            </p>

            <p>
                <strong>Сатушы:</strong>
                ${escapeHTML(product.seller)}
            </p>

            <p>
                <strong>Телефон:</strong>
                ${escapeHTML(
                    product.phone ||
                    "Көрсетілмеген"
                )}
            </p>

            ${
                product.phone
                ?
                `
                    <a
                        class="contact-button"
                        href="tel:${encodeURIComponent(product.phone)}"
                    >
                        Сатушыға қоңырау шалу
                    </a>
                `
                :
                ""
            }

        `;


        document.getElementById(
            "modal"
        ).style.display = "flex";


    } catch (error) {

        console.error(error);

        alert(
            "Тауар ақпаратын ашу мүмкін болмады"
        );
    }
}


function closeModal() {

    document.getElementById(
        "modal"
    ).style.display = "none";
}


document.getElementById(
    "search"
).addEventListener(
    "input",
    function() {
        loadProducts();
    }
);


document.getElementById(
    "productForm"
).addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const button =
            document.getElementById(
                "submitButton"
            );


        button.disabled = true;

        button.textContent =
            "Жариялануда...";


        const product = {

            name:
                document.getElementById(
                    "name"
                ).value.trim(),

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
                ).value.trim(),

            phone:
                document.getElementById(
                    "phone"
                ).value.trim(),

            description:
                document.getElementById(
                    "description"
                ).value.trim()
        };


        try {

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

                throw new Error(
                    data.message ||
                    "Тауар қосылмады"
                );
            }


            this.reset();


            currentCategory =
                "Барлығы";


            document.getElementById(
                "search"
            ).value = "";


            filterCategory(
                "Барлығы"
            );


            await loadProducts();


            alert(
                "Тауар сәтті жарияланды!"
            );


            scrollToProducts();


        } catch (error) {

            console.error(error);

            alert(
                error.message ||
                "Тауарды қосу кезінде қате болды"
            );


        } finally {

            button.disabled = false;

            button.textContent =
                "Тауарды жариялау";
        }
    }
);


window.addEventListener(
    "click",
    function(event) {

        const modal =
            document.getElementById("modal");


        if (
            event.target === modal
        ) {
            closeModal();
        }
    }
);


loadProducts();