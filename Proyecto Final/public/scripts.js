import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC9yxj26sXlZP5hJAbZag2-dI_Jvj-_bRM",
  authDomain: "carne-seca-5eecd.firebaseapp.com",
  projectId: "carne-seca-5eecd",
  storageBucket: "carne-seca-5eecd.appspot.com",
  messagingSenderId: "518641928461",
  appId: "1:518641928461:web:4202b7071a04305c190844"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function loadProducts() {
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

document.addEventListener('DOMContentLoaded', loadProducts);

window.showDetails = function(productId) {
    const docRef = doc(db, "productos", productId);
    getDoc(docRef).then((docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            document.getElementById('modalTitle').innerText = data.nombre;
            document.getElementById('modalDescription').innerText = data.descripcion;

            const productModal = new bootstrap.Modal(document.getElementById('productModal'));
            productModal.show();
        } else {
            console.log("No such document!");
        }
    });
}

function initMap() {
    var map = L.map('map').setView([24.044722, -104.617], 15); 

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([24.044722, -104.617]).addTo(map)
        .bindPopup('Carne Seca Gran Ternera')
        .openPopup();
}

document.addEventListener('DOMContentLoaded', initMap);
