const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

const productsFile = path.join(__dirname, "data", "products.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function getProducts() {
    const data = fs.readFileSync(productsFile, "utf8");
    return JSON.parse(data);
}

function saveProducts(products) {
    fs.writeFileSync(
        productsFile,
        JSON.stringify(products, null, 2)
    );
}

app.get("/api/products", (req, res) => {
    const products = getProducts();

    const search = (req.query.search || "")
        .toLowerCase()
        .trim();

    const result = products.filter(product =>
        product.name.toLowerCase().includes(search) ||
        product.category.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search)
    );

    res.json(result);
});

app.post("/api/products", (req, res) => {
    const {
        name,
        price,
        category,
        seller,
        phone,
        description
    } = req.body;

    if (!name || !price || !category || !seller) {
        return res.status(400).json({
            message: "Міндетті ақпараттарды толтырыңыз"
        });
    }

    const products = getProducts();

    const newProduct = {
        id: Date.now(),
        name: name,
        price: Number(price),
        category: category,
        seller: seller,
        phone: phone || "",
        description: description || "",
        createdAt: new Date().toISOString()
    };

    products.push(newProduct);

    saveProducts(products);

    res.status(201).json(newProduct);
});

app.delete("/api/products/:id", (req, res) => {
    const id = Number(req.params.id);

    const products = getProducts();

    const newProducts = products.filter(
        product => product.id !== id
    );

    if (products.length === newProducts.length) {
        return res.status(404).json({
            message: "Тауар табылмады"
        });
    }

    saveProducts(newProducts);

    res.json({
        message: "Тауар өшірілді"
    });
});

app.listen(PORT, () => {
    console.log("");
    console.log("=================================");
    console.log("       ALT MARKET");
    console.log("=================================");
    console.log(`Сайт: http://localhost:${PORT}`);
    console.log("=================================");
});