document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector(".form1 form");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const clienteData = {
      nome: document.getElementById("nome").value,
      email: document.getElementById("email").value,
      empresa: document.getElementById("empresa").value,
      telefone: document.getElementById("telefone").value,
      mensagem: document.getElementById("mensagem").value,
    };

    try {
      const response = await fetch("http://localhost:3000/api/clientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clienteData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();

      alert("Mensagem enviada com sucesso!");

      form.reset();
    } catch (error) {
      console.error("Error:", error);
      alert(
        "Ocorreu um erro ao enviar a mensagem. Por favor, tente novamente.",
      );
    }
  });
});

document
  .getElementById("link-contato")
  .addEventListener("click", function (event) {
    event.preventDefault();
    document.getElementById("form").scrollIntoView({ behavior: "smooth" });
  });
document
  .getElementById("link-sobre")
  .addEventListener("click", function (event) {
    event.preventDefault();
    document.getElementById("footer").scrollIntoView({ behavior: "smooth" });
  });
document
  .getElementById("link-servicos")
  .addEventListener("click", function (event) {
    event.preventDefault();
    document.getElementById("servicos").scrollIntoView({ behavior: "smooth" });
  });

document.querySelectorAll(".faq-question").forEach((question) => {
  question.addEventListener("click", () => {
    const item = question.parentElement;
    item.classList.toggle("active");

    document.querySelectorAll(".faq-item").forEach((otherItem) => {
      if (otherItem !== item && otherItem.classList.contains("active")) {
        otherItem.classList.remove("active");
      }
    });
  });
});
