// Код работает, но медленно

function generateAuthString(password) {
    const timestamp = new Date().toISOString().slice(0,10).replace(/-/g,"");
    const authString = password + "_" + timestamp;
    return md5(authString);
}

const password = "Valantis";
const authString = generateAuthString(password);

// ++++++++++

const PRODUCTS_PER_PAGE = 50;
let currentPage = 1;

document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts((currentPage - 1) * PRODUCTS_PER_PAGE, PRODUCTS_PER_PAGE);
    assignEventHandlers();
});

async function loadProducts(offset = 0, limit = 50, filters = {}) {
    const requestData = {
        action: 'get_ids',
        params: { offset, limit }
    };

    try {
        const data = await fetchData(requestData);
        displayProducts(data.result);
    } catch (error) {
        console.error('Error loading products:', error);
        throw new Error('Failed to load products');
    }
}

function assignEventHandlers() {
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadProducts((currentPage - 1) * PRODUCTS_PER_PAGE, PRODUCTS_PER_PAGE);
        }
    });

    document.getElementById('nextPage').addEventListener('click', () => {
        currentPage++;
        loadProducts((currentPage - 1) * PRODUCTS_PER_PAGE, PRODUCTS_PER_PAGE);
    });
}

async function fetchData(requestData) {
    try {
        const response = await fetch('https://api.valantis.store:41000/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Auth': authString
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        // const data = await response.json();
        // console.log('Response data:', data);

        // return data;
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw new Error('Failed to fetch data');
    }
}

const products = [];

async function displayProducts(productIds) {
    const productsContainer = document.getElementById('products');
    productsContainer.innerHTML = '';

    try {
        let productsHTML = '';

        for (const productId of productIds) {
            try {
                const product = await getDetailedProduct(productId);
                const existingProductIndex = products.findIndex(p => p.id === product.id);

                if (existingProductIndex === -1) {
                    products.push(product);
                    productsHTML += `
                        <div class="product">
                            <p><strong>ID:</strong> ${product.id}</p>
                            <p><strong>Product:</strong> ${product.product}</p>
                            <p><strong>Brand:</strong> ${product.brand}</p>
                            <p><strong>Price:</strong> ${product.price}</p>
                        </div>`;
                } else {
                    console.log('Product with ID', productId, 'is already in the list.');
                }
            } catch (error) {
                console.error('Error displaying product with ID', productId, ':', error);
            }
        }
        productsContainer.innerHTML = productsHTML;
    } catch (error) {
        console.error('Error displaying products:', error);
        document.getElementById('error-message').textContent = error.message;
    }
}

async function getDetailedProduct(productId) {
    const requestData = {
        action: 'get_items',
        params: { ids: [productId] }
    };
    console.log(requestData)
    try {
        const response = await fetchData(requestData);
        return response.result[0];
    } catch (error) {
        console.error('Error getting detailed product with ID', productId, ':', error);
        throw new Error('Failed to get detailed product with ID ' + productId);
    }
}