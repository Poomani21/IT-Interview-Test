let questions = [];
let filtered = [];
let index = 0;

const moduleName = "laravel";
const levels = ["basic", "medium", "hard"];

let bookmarks = JSON.parse(localStorage.getItem(moduleName + "_bookmarks")) || [];
let level = localStorage.getItem(moduleName + "_level") || "basic";
let answeredQuestions = JSON.parse(localStorage.getItem(moduleName + "_answeredQuestions_" + level)) || {};
let levelScore = parseInt(localStorage.getItem(moduleName + "_score_" + level)) || 0;
let correctCount = parseInt(localStorage.getItem(moduleName + "_correct_" + level)) || 0;
let wrongCount = parseInt(localStorage.getItem(moduleName + "_wrong_" + level)) || 0;

$(document).ready(function () {
  $("#score").text(levelScore);

  if (localStorage.getItem("darkMode") === "on") {
    $("body").addClass("dark");
  }

  $("body").append(`
    <div id="submitPopup" class="submit-popup" style="display:none;">
      <div class="popup-box">
        <div id="popupMessage"></div>
        <button id="popupOkBtn">Continue</button>
      </div>
    </div>
  `);

  $.getJSON("assets/data/laravel_questions_500.json", function (data) {
    questions = data;
    filtered = questions.filter(q => q.level === level);

    if (filtered.length === 0) {
      $("#questionContainer").html("<h3>No questions found for this level.</h3>");
      return;
    }

    loadQuestion();
    createNavigation();
    updateNavButtons();
  });
});

function loadQuestion() {
  let q = filtered[index];
  if (!q) return;

  let isBookmarked = bookmarks.some(item => item.id === q.id);
  let savedAnswer = answeredQuestions[q.id];

  let html = `
    <div class="question-box">
      <h3>${index + 1}. ${q.question}</h3>
      <div class="options">
  `;

  q.options.forEach((opt, i) => {
    let extraClass = "";

    if (savedAnswer) {
      if (i == savedAnswer.selected && savedAnswer.isCorrect) {
        extraClass = "correct answered";
      } else if (i == savedAnswer.selected && !savedAnswer.isCorrect && savedAnswer.selected !== null) {
        extraClass = "wrong answered";
      } else {
        extraClass = "answered";
      }
    }

    html += `<div class="option ${extraClass}" data-id="${i}">${opt}</div>`;
  });

  html += `
      </div>
      <button id="showAnswer" class="show-answer-btn">Show Answer</button>
      <div class="answer-box" style="display:${savedAnswer && savedAnswer.showAnswer ? 'block' : 'none'};">
        ${savedAnswer && savedAnswer.showAnswer ? 'Correct Answer : ' + q.options[q.answer] : ''}
      </div>
    </div>
  `;

  $("#questionContainer").html(html);

  $(".navItem").removeClass("active");
  $(`.navItem[data-id="${index}"]`).addClass("active");

  $("#bookmarkBtn").toggleClass("active", isBookmarked);

  updateNavButtons();
}

function createNavigation() {
  let nav = "";

  for (let i = 0; i < filtered.length; i++) {
    let q = filtered[i];
    let statusClass = "";

    if (answeredQuestions[q.id]) {
      if (answeredQuestions[q.id].selected !== null) {
        statusClass = answeredQuestions[q.id].isCorrect ? "done-correct" : "done-wrong";
      }
    }

    nav += `<span class="navItem ${i === index ? "active" : ""} ${statusClass}" data-id="${i}">${i + 1}</span>`;
  }

  $("#navigation").html(nav);
}

function allQuestionsAnswered() {
  return filtered.every(q =>
    answeredQuestions[q.id] && answeredQuestions[q.id].selected !== null
  );
}

function updateNavButtons() {
  $("#prev").toggle(index > 0);

  if (index === filtered.length - 1 && allQuestionsAnswered()) {
    $("#next").text("Submit").show();
  } else {
    $("#next").text("Next").show();
  }
}

function showSubmitPopup() {
  let currentLevelIndex = levels.indexOf(level);
  let nextLevel = levels[currentLevelIndex + 1];

  let icon = "";
  let message = "";

  if (nextLevel) {
    icon = `
      <svg width="70" height="70" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="30" fill="#ECFDF5"/>
        <path d="M20 33L28 41L44 24" stroke="#10B981" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    message = `
      <h2>Congratulations!</h2>
      <p>You completed <b>${level.toUpperCase()}</b> level.<br>
      Now moving to <b>${nextLevel.toUpperCase()}</b> level.</p>
    `;

    localStorage.setItem(moduleName + "_level", nextLevel);
  } else {
    icon = `
      <svg width="70" height="70" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="30" fill="#FEF3C7"/>
        <path d="M22 18H42V24C42 31 37 36 32 38C27 36 22 31 22 24V18Z" fill="#F59E0B"/>
        <path d="M26 44H38" stroke="#92400E" stroke-width="3" stroke-linecap="round"/>
        <path d="M32 38V44" stroke="#92400E" stroke-width="3" stroke-linecap="round"/>
        <path d="M20 22H16C16 28 20 31 24 31" stroke="#F59E0B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M44 22H48C48 28 44 31 40 31" stroke="#F59E0B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    message = `
      <h2>Awesome!</h2>
      <p>You completed <b>all levels</b> in this test.</p>
    `;
  }

  $("#popupMessage").html(icon + message);
  $("#submitPopup").fadeIn(300);
}

$(document).on("click", ".navItem", function () {
  index = $(this).data("id");
  loadQuestion();
});

$("#next").click(function () {
  if (index === filtered.length - 1) {
    if (allQuestionsAnswered()) {
      showSubmitPopup();
    }
    return;
  }

  if (index < filtered.length - 1) {
    index++;
    loadQuestion();
  }
});

$("#prev").click(function () {
  if (index > 0) {
    index--;
    loadQuestion();
  }
});

$(document).on("click", ".option", function () {
  let q = filtered[index];
  if (!q || answeredQuestions[q.id]) return;

  let selected = $(this).data("id");
  let isCorrect = selected == q.answer;

  $(".option").addClass("answered");

  if (isCorrect) {
    $(this).addClass("correct");
    levelScore++;
    correctCount++;

    $("#score").text(levelScore);

    localStorage.setItem(moduleName + "_score_" + level, levelScore);
    localStorage.setItem(moduleName + "_correct_" + level, correctCount);
  } else {
    $(this).addClass("wrong");
    wrongCount++;

    localStorage.setItem(moduleName + "_wrong_" + level, wrongCount);
  }

  answeredQuestions[q.id] = {
    selected: selected,
    isCorrect: isCorrect,
    showAnswer: false
  };

  localStorage.setItem(moduleName + "_answeredQuestions_" + level, JSON.stringify(answeredQuestions));
  createNavigation();
  updateNavButtons();
});

$(document).on("click", "#showAnswer", function () {
  let q = filtered[index];
  if (!q) return;

  $(".answer-box")
    .stop(true, true)
    .fadeIn(200)
    .html("Correct Answer : " + q.options[q.answer]);

  if (!answeredQuestions[q.id]) {
    answeredQuestions[q.id] = {
      selected: null,
      isCorrect: false,
      showAnswer: true
    };
  } else {
    answeredQuestions[q.id].showAnswer = true;
  }

  localStorage.setItem(moduleName + "_answeredQuestions_" + level, JSON.stringify(answeredQuestions));
  createNavigation();
  updateNavButtons();
});

$("#bookmarkBtn").click(function () {
  let q = filtered[index];
  if (!q) return;

  let exists = bookmarks.some(item => item.id === q.id);

  if (!exists) {
    bookmarks.push(q);
    localStorage.setItem(moduleName + "_bookmarks", JSON.stringify(bookmarks));
    $(this).addClass("active");
  } else {
    bookmarks = bookmarks.filter(item => item.id !== q.id);
    localStorage.setItem(moduleName + "_bookmarks", JSON.stringify(bookmarks));
    $(this).removeClass("active");
  }
});

$("#darkMode").click(function () {
  $("body").toggleClass("dark");
  localStorage.setItem("darkMode", $("body").hasClass("dark") ? "on" : "off");
});

$("#backToDashboard").click(function () {
  window.location.href = "laravel.html";
});

$("#resetTest").click(function () {
  localStorage.removeItem(moduleName + "_answeredQuestions_" + level);
  localStorage.removeItem(moduleName + "_score_" + level);
  localStorage.removeItem(moduleName + "_correct_" + level);
  localStorage.removeItem(moduleName + "_wrong_" + level);

  answeredQuestions = {};
  levelScore = 0;
  correctCount = 0;
  wrongCount = 0;
  index = 0;

  $("#score").text(levelScore);
  loadQuestion();
  createNavigation();
  updateNavButtons();
});

$(document).on("click", "#popupOkBtn", function () {
  window.location.href = "laravel.html";
});