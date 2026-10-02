const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const dataFolder = path.join(__dirname, "data");
const productsFile = path.join(dataFolder, "products.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder, { recursive: true });
}

if (!fs.existsSync(productsFile)) {
    fs.writeFileSync(productsFile, "[]", "utf8");
}

function getProducts() {
    try {
        const data = fs.readFileSync(productsFile, "utf8");

        if (!data.trim()) {
            return [];
        }

        return JSON.parse(data);
    } catch (error) {
        console.error("Оқу қатесі:", error);
        return [];
    }
}

function saveProducts(products) {
    try {
        fs.writeFileSync(
            productsFile,
            JSON.stringify(products, null, 2),
            "utf8"
        );

        return true;
    } catch (error) {
        console.error("Сақтау қатесі:", error);
        return false;
    }
}

app.get("/api/products", (req, res) => {
    const products = getProducts();

    const search = String(
        req.query.search || ""
    ).toLowerCase().trim();

    const result = products.filter(product =>
        String(product.name || "")
            .toLowerCase()
            .includes(search) ||
        String(product.category || "")
            .toLowerCase()
            .includes(search) ||
        String(product.description || "")
            .toLowerCase()
            .includes(search)
    );

    res.json(result);
});

app.post("/api/products", (req, res) => {

    const name = String(
        req.body.name || ""
    ).trim();

    const price = Number(
        req.body.price
    );

    const category = String(
        req.body.category || ""
    ).trim();

    const seller = String(
        req.body.seller || ""
    ).trim();

    const phone = String(
        req.body.phone || ""
    ).trim();

    const description = String(
        req.body.description || ""
    ).trim();

    if (
        !name ||
        !category ||
        !seller ||
        !Number.isFinite(price) ||
        price <= 0
    ) {
        return res.status(400).json({
            message:
                "Атауы, бағасы, категориясы және сатушысы міндетті"
        });
    }

    const products = getProducts();

    const newProduct = {
        id: Date.now(),
        name: name,
        price: price,
        category: category,
        seller: seller,
        phone: phone,
        description: description,
        createdAt: new Date().toISOString()
    };

    products.unshift(newProduct);

    const saved = saveProducts(products);

    if (!saved) {
        return res.status(500).json({
            message:
                "Тауарды файлға сақтау мүмкін болмады"
        });
    }

    console.log(
        "Тауар қосылды:",
        newProduct.name
    );

    res.status(201).json(newProduct);
});

app.listen(PORT, "0.0.0.0", () => {
    console.log("==============================");
    console.log("       ALT MARKET");
    console.log("==============================");
    console.log(`http://localhost:${PORT}`);
    console.log("==============================");
});