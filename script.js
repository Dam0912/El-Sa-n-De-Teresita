const navToggle = document.querySelector(".nav-toggle");
const tabs = document.querySelectorAll(".tab");
const menuCards = document.querySelectorAll(".menu-card");
const contactForm = document.querySelector(".contact-form");
const menuNote = document.querySelector(".menu-note");
const orderList = document.querySelector(".order-list");
const addOrderButton = document.querySelector(".add-order");
const formStatus = document.querySelector(".form-status");
const whatsappNumber = "528991110801";

if (navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    document.body.classList.remove("nav-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

const filterLabels = {
  todos: "todo el menú",
  tamales: "tamales por docena",
  guisos: "tacos y gorditas de guisos",
  platillos: "platillos completos",
};

const getOrderFields = () => Array.from(document.querySelectorAll(".order-input"));

const renumberOrders = () => {
  const orderItems = Array.from(document.querySelectorAll(".order-item"));

  orderItems.forEach((item, index) => {
    const title = item.querySelector(".order-title");
    const textarea = item.querySelector(".order-input");
    const removeButton = item.querySelector(".remove-order");

    if (title) title.textContent = `Pedido ${index + 1}`;
    if (textarea) textarea.setAttribute("aria-label", `Pedido ${index + 1}`);
    if (removeButton) removeButton.hidden = orderItems.length === 1;
  });
};

const createOrderField = (value = "") => {
  if (!orderList) return null;

  const item = document.createElement("div");
  item.className = "order-item";

  const header = document.createElement("div");
  header.className = "order-item-header";

  const title = document.createElement("span");
  title.className = "order-title";

  const removeButton = document.createElement("button");
  removeButton.className = "remove-order";
  removeButton.type = "button";
  removeButton.textContent = "Quitar";

  const textarea = document.createElement("textarea");
  textarea.className = "order-input";
  textarea.name = "pedidos[]";
  textarea.rows = 3;
  textarea.placeholder = "¿Qué más te gustaría ordenar?";
  textarea.required = true;
  textarea.value = value;

  removeButton.addEventListener("click", () => {
    item.remove();
    renumberOrders();
    getOrderFields()[0]?.focus();
  });

  header.append(title, removeButton);
  item.append(header, textarea);
  orderList.appendChild(item);
  renumberOrders();

  return textarea;
};

const addOrderToForm = (value = "") => {
  const fields = getOrderFields();
  const emptyField = fields.find((field) => !field.value.trim());
  const targetField = emptyField || createOrderField(value);

  if (targetField && !emptyField) targetField.value = value;
  if (targetField && emptyField && value) targetField.value = value;

  return targetField;
};

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => {
      item.classList.remove("active");
      item.setAttribute("aria-pressed", "false");
    });
    tab.classList.add("active");
    tab.setAttribute("aria-pressed", "true");

    const filter = tab.dataset.filter;
    let visibleCount = 0;
    menuCards.forEach((card) => {
      const shouldShow = filter === "todos" || card.dataset.category === filter;
      card.classList.toggle("is-hidden", !shouldShow);
      if (shouldShow) visibleCount += 1;
    });

    if (menuNote) {
      menuNote.textContent = `Mostrando ${filterLabels[filter]}: ${visibleCount} opciones. Confirma disponibilidad del día por WhatsApp.`;
    }
  });
});

menuCards.forEach((card) => {
  const dishName = card.querySelector("h3")?.textContent?.trim();
  const dishInfo = card.querySelector(".dish-info");
  const isGuiso = card.dataset.category === "guisos";

  if (!dishName || !dishInfo) return;

  let selectedPresentation = "";

  const button = document.createElement("button");
  button.className = "dish-order";
  button.type = "button";
  button.textContent = isGuiso ? "Elige taco o gordita" : "Pedir este platillo";
  button.disabled = isGuiso;

  if (isGuiso) {
    const picker = document.createElement("div");
    picker.className = "presentation-picker";
    picker.setAttribute("role", "group");
    picker.setAttribute("aria-label", `Presentación para ${dishName}`);

    ["Taco", "Gordita"].forEach((presentation) => {
      const option = document.createElement("button");
      option.className = "presentation-option";
      option.type = "button";
      option.textContent = presentation;
      option.dataset.presentation = presentation;
      option.setAttribute("aria-pressed", "false");

      option.addEventListener("click", () => {
        selectedPresentation = presentation;

        picker.querySelectorAll(".presentation-option").forEach((item) => {
          const isSelected = item === option;
          item.classList.toggle("is-selected", isSelected);
          item.setAttribute("aria-pressed", String(isSelected));
        });

        button.disabled = false;
        button.textContent = `Pedir ${presentation.toLowerCase()}`;
      });

      picker.appendChild(option);
    });

    dishInfo.appendChild(picker);
  }

  button.addEventListener("click", () => {
    if (isGuiso && !selectedPresentation) return;

    const orderPrompt = isGuiso
      ? `Me gustaría ordenar: ${selectedPresentation} de ${dishName}.\nCantidad: `
      : `Me gustaría ordenar: ${dishName}.\nCantidad: `;
    const targetField = addOrderToForm(orderPrompt);

    document.querySelector("#contacto")?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => targetField?.focus(), 450);
  });

  dishInfo.appendChild(button);
});

addOrderButton?.addEventListener("click", () => {
  const targetField = createOrderField();
  targetField?.focus();
});

renumberOrders();

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    const formData = new FormData(contactForm);
    const nombre = String(formData.get("nombre") || "Cliente").trim();
    const telefono = String(formData.get("telefono") || "").trim();
    const pedidos = getOrderFields()
      .map((field) => field.value.trim())
      .filter(Boolean)
      .map((pedido, index) => `${index + 1}. ${pedido}`);
    const pedido = pedidos.join("\n");
    const mensaje = `Hola, soy ${nombre}. Mi teléfono es ${telefono}. Quiero pedir:\n${pedido}`;

    if (formStatus) {
      formStatus.textContent = "Abriendo WhatsApp con tu pedido...";
    }

    window.location.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensaje)}`;
  });
}
