const form = document.querySelector(".form_cad");
const inputEmail = document.getElementById('inputEmail');
const inputPassword = document.getElementById('inputPassword');
const input_fail = document.querySelectorAll(".input_fail");
const input_ok = document.querySelectorAll(".input_ok");
const input = document.querySelectorAll('input');
const span = document.querySelectorAll("span");
const creationStatus = document.querySelector('#creationstatus');
const user_sucesso = document.querySelectorAll('user_sucesso');
const user_falha = document.querySelectorAll('user_falha');

let checkEmailStatus = false
let checkPasswordStatus = false

form.addEventListener("submit", (event) => {
    checkLoginEmail();
    checkLoginPassword();
    event.preventDefault();

    function checkLoginEmail() {
        let loginError = [];
        if (inputEmail.value.length == 0) {
            event.preventDefault();
            loginError.push("Coloque seu Email!");
            span[0].innerText = loginError;
            input[0].classList.add('input_fail');
            checkEmailStatus = false;
        }
        else {
            loginError.push("");
            span[0].innerText = loginError;
            input[0].classList.add('input_ok');
            checkEmailStatus = true;
            event.preventDefault();
        }
        function isEmail(email) {
            return /^[A-Za-z0-9_\-\.]+@[A-Za-z0-9_\-\.]{2,}\.[A-Za-z0-9]{2,}(\.[A-Za-z0-9])?/.test(
                email
            );
        }
    }

    function checkLoginPassword() {
        let loginError = [];
        if (inputPassword.value == "" || inputPassword.value == null) {
            event.preventDefault();
            loginError.push("Coloque a senha!");
            span[1].innerText = loginError;
            input[1].classList.add('input_fail');
            checkPasswordStatus = false;
        } else {
            loginError.push("");
            span[1].innerText = loginError;
            input[1].classList.add('input_ok');
            checkPasswordStatus = true;
            event.preventDefault();
        }
    }

    function fetchAPI() {
        let loginError = [];

        if (checkEmailStatus == true && checkPasswordStatus == true){
        fetch('http://todo-api.ctd.academy:3000/v1/users/login', {
            method: 'POST',
            headers: {
                'Accept': '*/* , application/json, text/plain',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: `${inputEmail.value}`,
                password: `${inputPassword.value}`,
            }),
        })
            .then((res) => {
                if (res.status == 201) { 
                    res.json().then(data => {
                        if (data.jwt != undefined) {
                            localStorage.setItem("Token", JSON.stringify(data.jwt));
                            loginError.push("Bem-Vindo(a)!");
                            creationStatus.innerText = loginError;
                            creationStatus.classList.remove("user_falha");
                            creationStatus.classList.add("user_sucesso");
                            input[0].classList.remove("input_fail");
                            input[1].classList.remove("input_fail");
                            input[0].classList.add("input_ok");
                            input[1].classList.add("input_ok");
                            setTimeout(() => {
                                window.location.href = "tarefas.html";
                              },1000);
                        }
                    });
                } else if (res.status == 400) {
                    console.log({ "Error 400": "Usuário ou senha incorretos" });
                    loginError.push("Ops, Email ou senha incorretos!");
                    creationStatus.innerText = loginError;
                    creationStatus.classList.remove("user_sucesso");
                    creationStatus.classList.add("user_falha");
                    input[0].classList.remove("input_ok");
                    input[1].classList.remove("input_ok");
                    input[0].classList.add("input_fail");
                    input[1].classList.add("input_fail");

                } else if (res.status == 404) {
                    console.log({ "Error 404": "Usuário ou senha incorretos" });
                    loginError.push("Ops, Email ou senha incorretos!");
                    creationStatus.innerText = loginError;
                    creationStatus.classList.remove("user_sucesso");
                    creationStatus.classList.add("user_falha");
                    input[0].classList.remove("input_ok");
                    input[1].classList.remove("input_ok");
                    input[0].classList.add("input_fail");
                    input[1].classList.add("input_fail");
                } else {
                    console.log({ "Error": "Erro de conexao do servidor" });
                    loginError.push("Ops, sem conexão!");
                    creationStatus.innerText = loginError;
                    creationStatus.classList.remove("user_sucesso");
                    creationStatus.classList.add("user_falha");
                }
            });
      };
    }
    fetchAPI();
})
