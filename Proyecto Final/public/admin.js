import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyC9yxj26sXlZP5hJAbZag2-dI_Jvj-_bRM",
  authDomain: "carne-seca-5eecd.firebaseapp.com",
  projectId: "carne-seca-5eecd",
  storageBucket: "carne-seca-5eecd.appspot.com",
  messagingSenderId: "518641928461",
  appId: "1:518641928461:web:4202b7071a04305c190844"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log('Inició sesión:', userCredential.user);
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('admin-section').style.display = 'block';
            loadProducts();
        })
        .catch((error) => {
            console.error('Error al iniciar sesión:', error);
        });
});

const logoutButton = document.getElementById('logout-button');
logoutButton.addEventListener('click', () => {
    signOut(auth).then(() => {
        console.log('Cerró sesión');
        document.getElementById('login-section').style.display = 'block';
        document.getElementById('admin-section').style.display = 'none';
    }).catch((error) => {
        console.error('Error al cerrar sesión:', error);
    });
});

async function loadProducts() {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';

    const querySnapshot = await getDocs(collection(db, "productos"));
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `
            <div>
                <h5>${data.nombre}</h5>
                <p>Precio: $${data.precio}</p>
                <p>Peso: ${data.peso}</p>
                <p>${data.descripcion}</p>
                <p>Existencias: ${data.existencias}</p>
                ${data.imagenURL ? `<img src="${data.imagenURL}" alt="${data.nombre}" style="width: 100px;">` : ''}
            </div>
            <div>
                <button class="btn btn-warning btn-sm me-2" onclick="editProduct('${doc.id}')">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="confirmDeleteProduct('${doc.id}')">Eliminar</button>
            </div>
        `;
        productList.appendChild(li);
    });
}

const addProductForm = document.getElementById('add-product-form');
const productButton = document.getElementById('product-button');
let currentProductId = null;

addProductForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('product-name').value;
    const precio = document.getElementById('product-price').value;
    const descripcion = document.getElementById('product-description').value;
    const peso = document.getElementById('product-weight').value;
    const existencias = document.getElementById('product-stock').value;
    const imagen = document.getElementById('product-image').files[0];

    const productId = currentProductId || nombre.toLowerCase().replace(/\s/g, '-');

    let imagenURL = '';

    if (imagen) {
        const storageRef = ref(storage, `productos/${productId}/${imagen.name}`);
        await uploadBytes(storageRef, imagen);
        imagenURL = await getDownloadURL(storageRef);
    }

    const productData = {
        nombre: nombre,
        precio: parseFloat(precio),
        descripcion: descripcion,
        peso: peso,
        existencias: parseInt(existencias)
    };

    if (imagenURL) {
        productData.imagenURL = imagenURL;
    }

    await setDoc(doc(db, "productos", productId), productData);

    addProductForm.reset();
    productButton.textContent = "Agregar Producto";
    Swal.fire({
        icon: 'success',
        title: currentProductId ? '¡Producto actualizado con éxito!' : '¡Producto agregado con éxito!',
        showConfirmButton: false,
        timer: 1500
    });
    currentProductId = null;
    loadProducts();
    loadProductsFromMainPage();
});

async function loadProductsFromMainPage() {
    const productsContainer = document.getElementById('productos-container');
    productsContainer.innerHTML = ''; 
    const querySnapshot = await getDocs(collection(db, "productos"));

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-4';
        col.innerHTML = `
            <div class="card h-100" onclick="showDetails('${doc.id}')">
                ${data.imagenURL ? `<img src="${data.imagenURL}" class="card-img-top" alt="${data.nombre}">` : ''}
                <div class="card-body text-center">
                    <h5 class="card-title text-rojo">${data.nombre}</h5>
                    <p class="card-text">${data.peso}</p>
                    <p class="card-text">$${data.precio}</p>
                    <p class="card-text">Existencias: ${data.existencias}</p>
                </div>
            </div>
        `;
        productsContainer.appendChild(col);
    });
}

window.editProduct = async (productId) => {
    const docRef = doc(db, "productos", productId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        currentProductId = productId;
        document.getElementById('product-name').value = data.nombre;
        document.getElementById('product-price').value = data.precio;
        document.getElementById('product-description').value = data.descripcion;
        document.getElementById('product-weight').value = data.peso;
        document.getElementById('product-stock').value = data.existencias;

        productButton.textContent = "Editar Producto";
        addProductForm.scrollIntoView({ behavior: 'smooth' });
    }
};

window.confirmDeleteProduct = async (productId) => {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esto",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminarlo',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            deleteProduct(productId);
        }
    });
};

window.deleteProduct = async (productId) => {
    const docRef = doc(db, "productos", productId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.imagenURL) {
            const storageRef = ref(storage, data.imagenURL);
            await deleteObject(storageRef).catch((error) => {
                console.error("Error al eliminar la imagen: ", error);
            });
        }

        await deleteDoc(doc(db, "productos", productId));
        Swal.fire({
            icon: 'success',
            title: '¡Producto eliminado con éxito!',
            showConfirmButton: false,
            timer: 1500
        });
        loadProducts();
        loadProductsFromMainPage();
    } else {
        console.log("¡No existe tal documento!");
    }
};

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log('Usuario ha iniciado sesión:', user);
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('admin-section').style.display = 'block';
        loadProducts();
        loadProductsFromMainPage();
    } else {
        console.log('No hay usuario iniciado sesión');
        document.getElementById('login-section').style.display = 'block';
        document.getElementById('admin-section').style.display = 'none';
    }
});
