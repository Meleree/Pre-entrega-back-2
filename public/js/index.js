document.addEventListener('DOMContentLoaded', () => {
  const socket = io();

  const formNewProduct = document.getElementById("formNewProduct");
  const productList = document.getElementById("productList");

  if (formNewProduct && productList) {
    formNewProduct.addEventListener("submit", async (event) => {
      event.preventDefault(); 

      const formData = new FormData(formNewProduct);

      try {
        const response = await fetch("/api/products", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          alert("Producto agregado con éxito.");
          formNewProduct.reset(); 
          const newProduct = await response.json();
          socket.emit("productAdded", newProduct.payload);
        } else {
          const error = await response.json();
          console.error("Error en la respuesta del servidor:", error);
          alert(`Error: ${error.message}`);
        }
      } catch (error) {
        console.error("Error al agregar el producto:", error);
        alert("Hubo un problema al agregar el producto.");
      }
    });

    socket.on("productAdded", (newProduct) => {
      const productCard = document.createElement("div");
      productCard.classList.add("product-card");
      productCard.setAttribute("data-id", newProduct._id);

      productCard.innerHTML = `
        <div class="product-image-container">
          <img class="product-image" src="${newProduct.thumbnail}" alt="${newProduct.title}">
        </div>
        <h2 class="product-title">${newProduct.title}</h2>
        <h3 class="product-price">Precio: $${newProduct.price}</h3>
        <button class="add-to-cart-btn btn" data-id="${newProduct._id}">Agregar al carrito</button>
        <button class="delete-btn btn" data-id="${newProduct._id}">Eliminar</button>
      `;

      productList.appendChild(productCard);
    });

    productList.addEventListener("click", (e) => {
      if (e.target.classList.contains("delete-btn")) {
        const productId = e.target.getAttribute("data-id");
        socket.emit("deleteProduct", productId); 
      }
    });

    socket.on("productDeleted", (id) => {
      const itemToDelete = document.querySelector(`.product-card[data-id="${id}"]`);
      if (itemToDelete) {
        itemToDelete.remove();
      }
    });
  }

  const viewCartButton = document.getElementById("view-cart");
  if (viewCartButton) {
    viewCartButton.addEventListener("click", async () => {
      let cartId = localStorage.getItem("cartId");
      if (cartId) {
        try {
          const response = await fetch(`/api/carts/${cartId}`);
          if (!response.ok) {
            console.warn("El carrito almacenado no existe. Se creará uno nuevo.");
            cartId = null;
            localStorage.removeItem("cartId");
          } else {
            window.location.href = `/carts/${cartId}`;
            return;
          }
        } catch (error) {
          console.error("Error al validar el carrito:", error);
          alert("Hubo un problema al validar el carrito.");
          return;
        }
      }

      try {
        const response = await fetch("/api/carts", { method: "POST" });
        if (!response.ok) throw new Error("No se pudo crear el carrito.");
        const data = await response.json();
        cartId = data.payload._id;
        localStorage.setItem("cartId", cartId);
        window.location.href = `/carts/${cartId}`;
      } catch (error) {
        console.error("Error al crear el carrito:", error);
        alert("Hubo un problema al crear el carrito.");
      }
    });
  }

  document.body.addEventListener("click", async (event) => {
    if (event.target.classList.contains("add-to-cart-btn")) {
      const productId = event.target.dataset.id;

      let cartId = localStorage.getItem("cartId");

      if (cartId) {
        try {
          const response = await fetch(`/api/carts/${cartId}`);
          if (!response.ok) {
            console.warn("El carrito almacenado no existe. Se creará uno nuevo.");
            cartId = null; 
            localStorage.removeItem("cartId");
          }
        } catch (error) {
          console.error("Error al validar el carrito:", error);
          cartId = null;
        }
      }

      if (!cartId) {
        try {
          const response = await fetch("/api/carts", { method: "POST" });
          if (!response.ok) throw new Error("No se pudo crear el carrito.");
          const data = await response.json();
          cartId = data.payload._id;
          localStorage.setItem("cartId", cartId);
        } catch (error) {
          console.error("Error al crear el carrito:", error);
          alert("Hubo un problema al crear el carrito.");
          return;
        }
      }

      try {
        const response = await fetch(`/api/carts/${cartId}/product/${productId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: 1 }),
        });

        if (response.ok) {
          alert("Producto agregado al carrito con éxito.");
        } else {
          const errorData = await response.json();
          console.error("Error en la respuesta del servidor:", errorData);
          alert(`Error: ${errorData.message}`);
        }
      } catch (error) {
        console.error("Error al agregar producto al carrito:", error);
        alert("Hubo un problema al agregar el producto al carrito.");
      }
    }
  });

  document.body.addEventListener("click", async (event) => {
    if (event.target.classList.contains("checkout-btn")) {
      const cartId = localStorage.getItem("cartId");
      if (!cartId) {
        alert("No hay un carrito válido para procesar la compra.");
        return;
      }

      try {
        const response = await fetch(`/api/carts/${cartId}/checkout`, {
          method: "POST",
        });

        if (response.ok) {
          alert("¡Compra realizada con éxito!");
          localStorage.removeItem("cartId"); 
          window.location.href = "/";
        } else {
          const errorData = await response.json();
          console.error("Error en la respuesta del servidor:", errorData);
          alert(`Error: ${errorData.message}`);
        }
      } catch (error) {
        console.error("Error al realizar la compra:", error);
        alert("Hubo un problema al realizar la compra.");
      }
    }
  });
});