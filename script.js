console.log(1003)
let outerCircle = document.getElementById('outerCircle')
let timer;
let isRunning = false;
const timerDisplay = document.getElementById('timer');
const sessionsDisplay = document.getElementById('sessions');
const breaksDisplay = document.getElementById('breaks');
const loginModal = document.getElementById('loginModal');
const loginBtn = document.getElementById('loginBtn');
let pomodorosCountDisplay = document.getElementById('pomodoros-count');
let closeModalRegister = document.getElementById('closeModalRegister');
let registerModal = document.getElementById('registerModal');
let registerBtn = document.getElementById('register');
let submitRegister = document.getElementById('submitRegister')
const progressCircle = document.getElementById('progressCircle');
let closeStats = document.getElementById('closeStats')
let statistics = document.getElementById('statistics')
// INITIALIZE POMODOROS DAILY IN LOCAL STOARAGE
let sessionCount = localStorage.getItem('sessions') 
    ? parseInt(localStorage.getItem('sessions')) 
    : 0;
if (!localStorage.getItem('sessions')) {
    localStorage.setItem('sessions', sessionCount.toString());
}

// INITIALIZE POMODOROS MONTHLY IN LOCAL STOARAGE
let pomodorosCount = localStorage.getItem('pomodoros') 
    ? parseInt(localStorage.getItem('pomodoros')) 
    : 0;
if (!localStorage.getItem('pomodoros')) {
    localStorage.setItem('pomodoros', pomodorosCount.toString());
}

// INITIALIZE LOGIN STATUS IN LOCAL STOARAGE
if (!localStorage.getItem('statusOfLogin')) {
    localStorage.setItem('statusOfLogin', 'unregistered');
}
let remainingTime = 1500; // 25 minutes in seconds
if (!remainingTime) {
    localStorage.setItem('remainingTime', '1500');
}

// SETTING UP POMODORO STORAGE IN LOCAL STORAGE
if (!localStorage.getItem('pomodoroStorage7')) {
    let arr = [] 
    let keeey = getCurrentDate()
    let obj = {
        keeey: 0
    }
    arr.push(obj)
    localStorage.setItem('pomodoroStorage7', JSON.stringify(arr));
}

function ifLogin() {
    if(localStorage.getItem('statusOfLogin') === 'login') {
        removeLoginAndRegisterBtns()
    }
}
ifLogin()

function getCurrentDate() {
    return new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
}

console.log(getCurrentDate());


// Load data from local storage
function loadData() {
    const storedSessions = localStorage.getItem('sessions') || 0;
    const storedBreaks = localStorage.getItem('breaks') || 0;
    const storedPomodoros = localStorage.getItem('pomodoros') || 0;
    const storedRemainingTime = localStorage.getItem('remainingTime');

    sessionsDisplay.innerText = storedSessions;
    pomodorosCountDisplay.innerText = storedPomodoros;

    if (storedRemainingTime) {
        remainingTime = parseInt(storedRemainingTime);
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        timerDisplay.innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    } else {
        timerDisplay.innerText = '25:00';
    }
}

closeModalRegister.onclick = function() {
    registerModal.style.display = "none";
};

window.onclick = function(event) {
    if (event.target === registerModal) {
        registerModal.style.display = "none";
    }
};

// CLOSE STATS POP UP EVENT LISTENER 
closeStats.addEventListener('click', function() {
    modal2.classList.remove('statsVisible');
    modal2.classList.add('statsInvisible');
})



// REGISTER
// REGISTER
// REGISTER

registerBtn.addEventListener('click', function() {
    registerModal.style.display = "block";

    window.onclick = function(event) {
    if (event.target === registerModal) {
        registerModal.style.display = "none";
    }
};
})

// USER CLICKED ON - CREATE ACCOUNT
submitRegister.addEventListener('click', function() {
    console.log('register')
    checkFields()
})

// CHECKING IF EMAIL, PASSWORD1 OR PASSWORD2 ARE EMPTY
function checkFields() {
    // GETTING ELEMENTS
    const email = document.getElementById('emailRegister');
    const password1 = document.getElementById('password1');
    const password2 = document.getElementById('password2');
    const passwordError = document.getElementById('passwordError');

    // USING REGEX TO CHECK IF EMAIL VALUD
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }


    // CHECK IF EMAIL EMPTY
    if (!email.value.trim()) {
        passwordError.style.display = 'block';
        passwordError.textContent = 'Email cannot be empty'
        return
    // CHECK EMAIL REGEX
    } else if (!isValidEmail(email.value)) {
        passwordError.style.display = 'block';
        passwordError.textContent = 'Value of the email is incorrect'
        return
    }

    // CHECK IF PASSWORD EMPTY
    if (!password1.value.trim() || !password2.value.trim()) {
        passwordError.style.display = 'block';
        passwordError.textContent = 'Password is empty'
        return
    // CHECK IF PASSWORD MATCH
    } else if (password1.value.trim() !== password2.value.trim()) {
        passwordError.textContent = 'Passwords values do not match'
        return
    }

    // REGISTER IS VALID
    // SENDING DATA TO BACK-END
    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email.value,
            password: password1.value
        })
    })
        .then(response => {
            if (response.ok) {
                registerModal.style.display = "none";
                localStorage.setItem('email', email.value);
                localStorage.setItem('statusOfLogin', 'login');
                removeLoginAndRegisterBtns()
                return response.json();
            } else {
                return response.json().then(error => {
                    console.log(157)
                    passwordError.style.display = 'block';
                    passwordError.textContent = 'User with this email already exists'
                    // throw new Error(error.message);
                });
            }
        })
        .then(data => {
            // alert(data.message);
            //  // Show success message
            console.log(data.message)
        })
        .catch(error => {
            // alert(`Error: ${error.message}`); // Show error message
        });
}


// PASSWORD VISIBILITY
function togglePasswordVisibility(passwordFieldId, toggleIconId) {
    const passwordField = document.getElementById(passwordFieldId);
    const toggleIcon = document.getElementById(toggleIconId);

    toggleIcon.addEventListener('click', function () {
        // Toggle password visibility
        const isPasswordVisible = passwordField.type === 'text';
        passwordField.type = isPasswordVisible ? 'password' : 'text';

        // Change the icon
        toggleIcon.classList.toggle('fa-eye'); // Normal eye icon
        toggleIcon.classList.toggle('fa-eye-slash'); // Slashed eye icon
    });
}
togglePasswordVisibility('password1', 'togglePassword1');
togglePasswordVisibility('password2', 'togglePassword2');

// END 
// END 
// END PASSWORD

// LOGIN
// LOGIN
// LOGIN
let submitLoginBtn = document.getElementById('submitLogin');
let passwordLoginDiv = document.getElementById('passwordLoginDiv');
submitLoginBtn.addEventListener('click', function() {
    if(passwordLoginDiv.classList.contains('passwordLoginVisible')) {
        passwordLoginDiv.classList.remove('passwordLoginVisible')
        passwordLoginDiv.classList.add('passwordLoginInvisible')
    }
    checkFieldsLogin()
    // console.log('haslo jest puste')
})

// CHECKING IF LOGIN EMAIL, PASSWORD1 OR PASSWORD2 ARE EMPTY
function checkFieldsLogin() {
    // GETTING ELEMENTS
    let passwordLogin = document.getElementById('passwordLogin');
    let emailLogin = document.getElementById('emailLogin');

    // USING REGEX TO CHECK IF EMAIL VALUD
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }


    // CHECK IF EMAIL EMPTY
    if (!emailLogin.value.trim()) {
        passwordLoginDiv.classList.toggle('passwordLoginInvisible')
        passwordLoginDiv.classList.toggle('passwordLoginVisible')
        passwordLoginDiv.textContent = 'Email cannot be empty'
        return
    // CHECK EMAIL REGEX
    } else if (!isValidEmail(emailLogin.value)) {
        passwordLoginDiv.classList.toggle('passwordLoginInvisible')
        passwordLoginDiv.classList.toggle('passwordLoginVisible')
        passwordLoginDiv.textContent = 'Value of the email is incorrect'
        return
    }

    // CHECK IF PASSWORD EMPTY
    let passwordLoginValue = passwordLogin.value
    if(passwordLoginValue == "") {
        passwordLoginDiv.classList.toggle('passwordLoginInvisible')
        passwordLoginDiv.classList.toggle('passwordLoginVisible')
        passwordLoginDiv.textContent = 'Password cannot be empty'
        return
    }

    // SENDING REQUEST TO BACK-END
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: emailLogin.value,
            password: passwordLoginValue
        })
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return response.json().then(error => {
                    passwordLoginDiv.classList.toggle('passwordLoginInvisible')
                    passwordLoginDiv.classList.toggle('passwordLoginVisible')
                    passwordLoginDiv.textContent = 'User not found or password is incorrect'
                    throw new Error(error.message);
                });
            }
        })
        .then(data => {
            localStorage.setItem('email', emailLogin.value);
            localStorage.setItem('statusOfLogin', 'login');
            console.log('Login successful!');
            loginModal.style.display = "none";

            // REMOVING LOGIN AND REGISTER BUTTONS AFTER LOGIN
            removeLoginAndRegisterBtns()

            // LOAD POMODOROS (TODAY, THIS MONTH) AFTER LOGIN
            let intoStr = String(data.pomodorosToday)
            loadPomodorosAfterLogin(intoStr, data.numberOfPomodoros)
        })
        .catch(error => {
            console.log(`Error: ${error.message}`);
        });

    // CLOSE THE LOGIN POP-UP
    closeLoginModal() 
}

// LOAD POMODOROS AFTER LOGIN
function loadPomodorosAfterLogin(pomodorosTooday, pomodorosThisMonth) {
    console.log(312, pomodorosTooday, pomodorosThisMonth)
    sessionsDisplay.innerText = pomodorosTooday
    pomodorosCountDisplay.innerText = pomodorosThisMonth

    // SETTING VALUE FROM DATABASE TO LOCAL STORAGE
    localStorage.setItem("sessions", pomodorosTooday);
    localStorage.setItem("pomodoros", pomodorosThisMonth);

}

// REMOVING LOGIN AND REGISTER BUTTONS
function removeLoginAndRegisterBtns() {
    forBtns.classList.remove('forBtns')
    forBtns.classList.add('forBtnsTwo')
    registerBtn.style.display = 'none';
    emailFromLS = localStorage.getItem('email')
    loginBtn.innerText = `Hi, ${emailFromLS}!`
}

loginBtn.onclick = function() {
    loginModal.style.display = "block";
};

closeModal.onclick = function() {
    loginModal.style.display = "none";
};

window.onclick = function(event) {
    if (event.target === loginModal) {
        loginModal.style.display = "none";
    }
};

// END OF LOGIN
// END OF LOGIN
// END OF LOGIN

// Save data to local storage
function saveData() {
    // localStorage.setItem('sessions', sessionCount);
    // localStorage.setItem('breaks', breakCount);
    // localStorage.setItem('pomodoros', pomodorosCount);
    localStorage.setItem('remainingTime', remainingTime);
}



document.getElementById('start').onclick = function(event) {
    event.preventDefault();
    if (!isRunning) {
        isRunning = true;
        startTimer();
    }
};

function startTimer() {
    timer = setInterval(() => {
        if (remainingTime > 0) {
            const minutes = Math.floor(remainingTime / 60);
            const seconds = remainingTime % 60;
            timerDisplay.innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            updateCircleProgress(remainingTime);
            remainingTime--;
            saveData();
            updateCircle()
            document.title = `${timerDisplay.innerText} - Pomodoro Timer`;
        } else {
            window.title = 'Pomodoro Finished!';
            emailFromLS = localStorage.getItem('email')
            console.log(341)
            fetch("/updatePomodoro", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email: emailFromLS})
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                localStorage.setItem("sessions", data.pomodorosToday);
                localStorage.setItem("pomodoros", data.allPomdorosForUser);
                console.log(350, data.allPomdorosForUser)
                refreshSessionsAndPomodoros();
            })
            .catch(error => console.error("Error:", error));

                    saveData(); 

                    remainingTime = 1500; 
                    timerDisplay.innerText = '25:00';
                    clearInterval(timer); 
                    isRunning = false;
                    localStorage.setItem('remainingTime', '1500');

                    
                    // SENDING TO BACK-END THAT USER FINISHED POMODORO

                }
            }, 1000);
}

function refreshSessionsAndPomodoros() {

    // RENEDERING POMODOROS DAILY
    numberOfPomodorosDaily = JSON.parse(localStorage.getItem("sessions"))
    sessionCount.innerText = numberOfPomodorosDaily

    // RENDERING POMODOROS ALL TIME
    allUserPomodoros = JSON.parse(localStorage.getItem("pomodoros"))
    pomodorosCountDisplay.innerText = allUserPomodoros
}

function updateCircleProgress(time) {
    const totalDuration = 1500; // Total duration in seconds
    const percentage = Math.max(0, Math.min(100, (time / totalDuration) * 100));
    const rotation = 360 * (1 - (percentage / 100));

    // Update the rotation of the ::before element
    progressCircle.style.setProperty('--rotation', `${rotation}deg`);

    // Dynamically change the border color
    const colorValue = Math.floor(255 * (1 - percentage / 100));
    progressCircle.style.borderColor = `rgb(${colorValue}, ${colorValue}, ${colorValue})`; // Gradually changes from black to white
}
document.getElementById('stop').onclick = function(event) {
    event.preventDefault();
    clearInterval(timer);
    isRunning = false;
};

document.getElementById('reset').onclick = function() {
    clearInterval(timer);
    isRunning = false;
    timerDisplay.innerText = '25:00';
    remainingTime = 1500; // Reset to 25 minutes
    // sessionsDisplay.innerText = sessionCount;
    // breaksDisplay.innerText = breakCount;
    // pomodorosCountDisplay.innerText = pomodorosCount;
    saveData();
};

// Initialize the app
loadData();

// CIRCLE LOGIC
function updateCircle() {
    const percentage = (remainingTime / 1500) * 100;
    //   console.log(percentage)
    const degrees = (100 - percentage) * 3.6; // Calculate degrees for clockwise filling
    outerCircle.style.background = `conic-gradient(black ${degrees}deg, transparent ${degrees}deg)`;
}

function renderingPomodoros(numberOfPomodoros) {
    pomodorosCountDisplay.innerText = numberOfPomodoros;
}

const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
];

let currentYear = 2025;
let currentMonth = 1; // February (0-indexed array)

const currentMonthElement = document.getElementById('currentMonth');
const calendarElement = document.getElementById('calendar');

const pomodoros = {
    "pomodorosToday": [
        {
            "date": "2025-02-05",
            "pomodoro_count": 65
        },
        {
            "date": "2025-02-06",
            "pomodoro_count": 25
        },
        {
            "date": "2025-02-01",
            "pomodoro_count": 6
        },
        {
            "date": "2025-02-02",
            "pomodoro_count": 10
        },
        {
            "date": "2025-02-03",
            "pomodoro_count": 0
        },
        {
            "date": "2025-02-04",
            "pomodoro_count": 2
        },
        {
            "date": "2025-02-07",
            "pomodoro_count": 8
        },
        {
            "date": "2025-02-08",
            "pomodoro_count": 10
        },
        {
            "date": "2025-02-09",
            "pomodoro_count": 8
        },
        {
            "date": "2025-02-10",
            "pomodoro_count": 4
        },
        {
            "date": "2025-02-11",
            "pomodoro_count": 0
        },
        {
            "date": "2025-02-12",
            "pomodoro_count": 5
        },
        {
            "date": "2025-02-13",
            "pomodoro_count": 3
        },
        {
            "date": "2025-02-14",
            "pomodoro_count": 4
        },
        {
            "date": "2025-02-15",
            "pomodoro_count": 4
        },
        {
            "date": "2025-02-16",
            "pomodoro_count": 2
        },
        {
            "date": "2025-02-17",
            "pomodoro_count": 1
        },
        {
            "date": "2025-02-18",
            "pomodoro_count": 10
        },
        {
            "date": "2025-02-19",
            "pomodoro_count": 9
        },
        {
            "date": "2025-02-20",
            "pomodoro_count": 7
        },
        {
            "date": "2025-02-21",
            "pomodoro_count": 0
        },
        {
            "date": "2025-02-22",
            "pomodoro_count": 7
        },
        {
            "date": "2025-02-23",
            "pomodoro_count": 0
        },
        {
            "date": "2025-02-24",
            "pomodoro_count": 1
        },
        {
            "date": "2025-02-25",
            "pomodoro_count": 4
        },
        {
            "date": "2025-02-26",
            "pomodoro_count": 8
        },
        {
            "date": "2025-02-27",
            "pomodoro_count": 10
        },
        {
            "date": "2025-02-28",
            "pomodoro_count": 9
        }
    ]
}

// LOADING STATISTICS POP UP
statistics.addEventListener('click', function() {
    updateCalendar()
})

let modal2 = document.getElementById('modal2')

function updateCalendar() {
    modal2.classList.remove('statsInvisible');
    modal2.classList.add('statsVisible');

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    console.log(490, currentMonth);
    currentMonthElement.textContent = `${months[currentMonth]} ${currentYear}`;
    calendarElement.innerHTML = '';

    emailFromLS2 = localStorage.getItem('email');
    currentMonth2 = currentMonth + 1;
    currentMonth3 = String(currentMonth2).padStart(2, '0');
    yearMonthToBackEnd = `${currentYear}-${currentMonth3}`;
    console.log(587, currentMonth3);
    console.log(588, emailFromLS2, yearMonthToBackEnd);

    // FETCH DATA FROM BACK-END
    fetch(`/getStatistics?email=${encodeURIComponent(emailFromLS2)}&YearAndMonth=${encodeURIComponent(yearMonthToBackEnd)}`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);

        // Check if data contains the expected structure
        if (!data || !data.pomodorosToday || !Array.isArray(data.pomodorosToday)) {
            console.error('Invalid data format:', data);
            return;
        }

        // Create a map for quick lookup
        const pomodoroMap = new Map();
        data.pomodorosToday.forEach(entry => {
            pomodoroMap.set(entry.date, entry.pomodoro_count);
        });

        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            // Get pomodoro count from the map
            const pomodoroCount = pomodoroMap.get(dateKey) || 0;

            // Set background color based on pomodoro count
            const backGroundColorSetUp = getBackgroundColor(pomodoroCount);

            function getBackgroundColor(pomodoroCount) {
                if (pomodoroCount === 0) {
                    return 'white'; // White for 0 Pomodoros
                }
                const maxCount = 10; // Maximum Pomodoro count
                const intensity = Math.round((pomodoroCount / maxCount) * 255); // Scale intensity
                return `rgb(255, ${255 - intensity}, ${255 - intensity})`; // Gradient from white to dark red
            }

            // Create day element
            const dayElement = document.createElement('div');
            dayElement.classList.add('dayElement');
            dayElement.style.backgroundColor = backGroundColorSetUp;
            dayElement.innerHTML = `
                <div class='d1'>
                    ${day}
                </div>
                <div class='d1'>
                    <div class='d2'>
                        ${pomodoroCount}
                    </div>
                    <div class='d2'>
                    </div>
                </div>
            `;

            calendarElement.appendChild(dayElement);
        }
    })
    .catch(error => console.error('Error:', error));
}


document.getElementById('prevMonth').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    updateCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    updateCalendar();
});

// Function to close login modal
function closeLoginModal() {
    loginModal.style.display = "none";
}