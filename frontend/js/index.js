let modalToToggle = ""
let openmodal = document.querySelectorAll('#adminBtn')
for (let i = 0; i < openmodal.length; i++) {
    openmodal[i].addEventListener('click', function (event) {
        event.preventDefault()
        modalToToggle = "#admin-modal"
        toggleModal()
    })
}

let emojiBtn = document.querySelector("#addBtn")
emojiBtn.addEventListener('click', function (event) {
    if (document.body.classList.contains('modal-active')) {
        toggleModal()
    }
    event.preventDefault()
    modalToToggle = "#add-pin-modal"
    toggleModal()
})

let editBtn = document.querySelector("#editBtn")
editBtn.addEventListener('click', function (event) {
    if (document.body.classList.contains('modal-active')) {
        toggleModal()
    }
    event.preventDefault()
    modalToToggle = "#edit-pin-modal"
    populateSelects()
    toggleModal()
})

let deleteBtn = document.querySelector("#deleteBtn")
deleteBtn.addEventListener('click', function (event) {
    if (document.body.classList.contains('modal-active')) {
        toggleModal()
    }
    event.preventDefault()
    modalToToggle = "#delete-pin-modal"
    populateSelects()
    toggleModal()
})

const overlay = document.querySelector('.modal-overlay')
overlay.addEventListener('click', toggleModal)

let closemodal = document.querySelectorAll('.modal-close')
for (let i = 0; i < closemodal.length; i++) {
    closemodal[i].addEventListener('click', toggleModal)
}

document.onkeydown = function (evt) {
    evt = evt || window.event
    let isEscape = false
    if ("key" in evt) {
        isEscape = (evt.key === "Escape" || evt.key === "Esc")
    } else {
        isEscape = (evt.keyCode === 27)
    }
    if (isEscape && document.body.classList.contains('modal-active')) {
        toggleModal()
    }
};

function toggleModal() {

    const body = document.querySelector('body')
    const modal = document.querySelector(modalToToggle)
    modal.classList.toggle('opacity-0')
    modal.classList.toggle('pointer-events-none')
    body.classList.toggle('modal-active')
    $("#email").val("")
    $("#password").val("")
}

let form = document.getElementById("loginForm")
form.addEventListener('submit', (e) => {
    let data = {
        email: form.elements.email.value,
        password: form.elements.password.value
    }
    e.preventDefault()
    fetch('https://pillar.timbwu.com/api/v1/login?apikey=SuperSecretKey', {
        // fetch('http://localhost:3000/api/v1/login?apikey=SuperSecretKey', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then((res) => res.json())
        .then((data) => {
            if (data.status == 200) {
                window.location.href = 'https://pillar.timbwu.com/api/v1/admin?apikey=SuperSecretKey'
            } else {
                alert(data.message)
            }
            console.log('Request Success: ', data)
        })
        .catch((error) => {
            console.log('Request Error: ', error)
        })

})


let pinform = document.getElementById("addPinForm")
pinform.addEventListener('submit', (e) => {
    let data = {
        lat: pinform.elements.latitude.value,
        lon: pinform.elements.longitude.value,
        contentType: pinform.elements.contentType.value,
        pinContent: pinform.elements.pinContent.value,
    }
    e.preventDefault()
    fetch('https://pillar.timbwu.com/api/v1/newPin?apikey=SuperSecretKey', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => {
        if (res.status === 200) {
            return "ok";
        } else {
            alert("Unauthorized! Bad api key!");
        }
    })
    if (document.body.classList.contains('modal-active')) {
        toggleModal()
        updatePillars()
    }
})

let editform = document.getElementById("editPinForm")
editform.addEventListener('submit', (e) => {
    let data = {
        id: editform.elements.pinID.value,
        lat: editform.elements.latitude.value,
        lon: editform.elements.longitude.value,
        contentType: editform.elements.contentType.value,
        pinContent: editform.elements.pinContent.value,
    }
    e.preventDefault()
    fetch('https://pillar.timbwu.com/api/v1/editPin?apikey=SuperSecretKey', {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => {
        if (res.status === 200) {

            return "ok";
        } else {
            return "something went wrong";
        }
    })
    if (document.body.classList.contains('modal-active')) {
        toggleModal()
        updatePillars()
    }
})

let deleteform = document.getElementById("deletePinForm")
deleteform.addEventListener('submit', (e) => {
    let data = {
        id: deleteform.elements.pinID.value,
        lat: deleteform.elements.latitude.value,
        lon: deleteform.elements.longitude.value,
        pinContent: deleteform.elements.pinContent.value,
    }
    console.log("HERE")
    e.preventDefault()
    fetch('https://pillar.timbwu.com/api/v1/deletePin?apikey=SuperSecretKey', {
        method: 'DELETE',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => {
        if (res.status === 200) {

            return "ok";
        } else {
            return "something went wrong";
        }
    })
    if (document.body.classList.contains('modal-active')) {
        toggleModal()
        updatePillars()
    }
})

function populateSelects() {
    fetch('https://pillar.timbwu.com/api/v1/pinIDs?apikey=SuperSecretKey', {
        // fetch('http://localhost:3000/api/v1/pinIDs?apikey=SuperSecretKey', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => {
        if (res.status === 200) {

            return res.json();
        } else {
            return "something went wrong";
        }
    }).then(function (data) {
        document.querySelectorAll(".pinIDSelect").forEach(e2 => {
            e2.innerHTML = '<option value="" disabled selected>Select an Option</option>';
        });

        data.forEach(e1 => {
            document.querySelectorAll(".pinIDSelect").forEach(e2 => {
                e2.insertAdjacentHTML('beforeend', `<option value="${e1.id}">${e1.id}</option>`)
            });
        });
    });
}

function selectOnChangeDelete() {
    let data = {
        id: $("#deleteSelect").find(":selected").val()
    }
    fetch('https://pillar.timbwu.com/api/v1/getPin?apikey=SuperSecretKey', {
        // fetch('http://localhost:3000/api/v1/getPin?apikey=SuperSecretKey', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => {
        if (res.status === 200) {
            return res.json();
        } else {
            return "something went wrong";
        }
    }).then(function (data) {
        $("pinContentDelete").value = data[0].content
        deleteform.elements.latitude.value = data[0].lat
        deleteform.elements.longitude.value = data[0].lon
        deleteform.elements.pinContent.value = data[0].content
    });
}

function selectOnChangeEdit() {
    let data = {
        id: $("#editSelect").find(":selected").val()
    }
    fetch('https://pillar.timbwu.com/api/v1/getPin?apikey=SuperSecretKey', {
        // fetch('http://localhost:3000/api/v1/getPin?apikey=SuperSecretKey', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => {
        if (res.status === 200) {
            return res.json();
        } else {
            return "something went wrong";
        }
    }).then(function (data) {
        editform.elements.latitude.value = data[0].lat
        editform.elements.longitude.value = data[0].lon
        editform.elements.pinContent.value = data[0].content
    });
}