(function () {
  "use strict";

  var lessonNames = ["Vial", "Volume", "Concentration", "Syringe", "Verify", "Challenge"];
  var challenges = [
    {
      eyebrow: "CONCENTRATION",
      question: "A fictional training vial contains 10 mg total and 2 mL of liquid. What is the concentration?",
      answers: ["2 mg/mL", "5 mg/mL", "20 mg/mL"],
      correct: 1,
      explanation: "Divide total amount by total volume: 10 mg ÷ 2 mL = 5 mg/mL."
    },
    {
      eyebrow: "RELATIONSHIP",
      question: "The total amount stays at 10 mg. If the liquid volume changes from 2 mL to 1 mL, what happens to concentration?",
      answers: ["It is cut in half", "It doubles", "It stays the same"],
      correct: 1,
      explanation: "The same total amount is now distributed through half the volume, so concentration doubles."
    },
    {
      eyebrow: "SYRINGE MARKINGS",
      question: "On a U-100 syringe, which marking represents 0.10 mL?",
      answers: ["1 unit", "10 units", "100 units"],
      correct: 1,
      explanation: "U-100 means 100 graduation units per 1 mL. Therefore 0.10 mL corresponds to the 10-unit marking."
    },
    {
      eyebrow: "SPOT THE MISTAKE",
      question: "A worksheet says: 5 mg total + 2 mL liquid = 5 mg/mL. What is wrong?",
      answers: ["The total amount is wrong", "The concentration is wrong", "Nothing is wrong"],
      correct: 1,
      explanation: "5 mg ÷ 2 mL = 2.5 mg/mL. The worksheet failed to divide by the total volume."
    },
    {
      eyebrow: "UNIT CONVERSION",
      question: "Which statement is mathematically correct?",
      answers: ["1 mg = 100 mcg", "1 mg = 1,000 mcg", "1 mg = 10,000 mcg"],
      correct: 1,
      explanation: "One milligram equals 1,000 micrograms. Normalize units before comparing values."
    },
    {
      eyebrow: "CONCENTRATION",
      question: "A fictional training vial contains 12 mg total in 3 mL. What is the concentration?",
      answers: ["4 mg/mL", "9 mg/mL", "36 mg/mL"],
      correct: 0,
      explanation: "12 mg ÷ 3 mL = 4 mg/mL."
    },
    {
      eyebrow: "TOTAL AMOUNT",
      question: "Adding more liquid to a vial changes which quantity?",
      answers: ["The total compound amount", "The concentration", "Both quantities"],
      correct: 1,
      explanation: "Adding liquid changes concentration. It does not create or remove the original compound amount."
    },
    {
      eyebrow: "SYRINGE CALIBRATION",
      question: "On a U-40 syringe, which marking represents 0.25 mL?",
      answers: ["10 units", "25 units", "40 units"],
      correct: 0,
      explanation: "U-40 means 40 graduation units per 1 mL. 0.25 × 40 = 10 units."
    },
    {
      eyebrow: "READ THE LABEL",
      question: "A vial label that reads 10 mg tells you:",
      answers: ["The total amount in the vial", "The amount in every mL", "The syringe marking to use"],
      correct: 0,
      explanation: "The vial label identifies total content. Concentration requires a known total liquid volume."
    },
    {
      eyebrow: "VERIFY",
      question: "Before dividing values in a concentration problem, what should you check first?",
      answers: ["That the units are compatible", "That the syringe is full", "That every vial uses the same volume"],
      correct: 0,
      explanation: "Values must use compatible units. Convert mg and mcg before calculating or comparing them."
    }
  ];

  var whyContent = {
    vial: {
      title: "Total amount is not concentration.",
      body: "<p>The number printed on a vial describes the total quantity of compound in that container.</p><p>Concentration answers a different question: how much of that compound exists in each unit of liquid volume. Until a volume is known, concentration cannot be determined.</p>"
    },
    volume: {
      title: "More liquid means a lower concentration.",
      body: "<p>Imagine the same fixed number of particles spreading through a larger space. The total amount has not changed, but each milliliter now contains a smaller share.</p><p>That is why increasing liquid volume lowers concentration when the total amount remains fixed.</p>"
    },
    concentration: {
      title: "Division describes the relationship.",
      body: "<p>Concentration is total amount divided by total volume. The result is written as an amount per unit of volume, such as mg/mL.</p><p>The slash means &ldquo;per.&rdquo; A concentration of 5 mg/mL means each 1 mL contains 5 mg when the solution is uniform.</p>"
    },
    syringe: {
      title: "A syringe marking is a volume scale.",
      body: "<p>The numbered markings on an insulin syringe are tied to that syringe's calibration. U-100 corresponds to 100 graduation units per mL; U-40 corresponds to 40 per mL.</p><p>Those markings do not independently tell you milligrams or micrograms. A compound amount can only be determined when concentration is also known.</p>"
    },
    verify: {
      title: "Verification catches unit errors.",
      body: "<p>Most mistakes begin before the arithmetic: confusing total amount with concentration, mixing mg with mcg, or treating syringe markings as a compound dose.</p><p>A reliable check names every quantity, normalizes units, performs the division, and confirms that the result has the expected units.</p>"
    },
    challenge: {
      title: "Feedback builds a mental model.",
      body: "<p>Each training question isolates one relationship. The explanation matters more than the score.</p><p>These are fictional math scenarios, not preparation or dosing directions.</p>"
    }
  };

  var state = {
    lesson: 0,
    completed: -1,
    vialMg: 10,
    volume: 2,
    syringeScale: 100,
    syringeVolume: 0.10,
    challenge: 0,
    score: 0,
    answered: false,
    selected: null
  };

  var hero = document.getElementById("hero");
  var lab = document.getElementById("labExperience");
  var completion = document.getElementById("completion");
  var stage = document.getElementById("lessonStage");
  var nextButton = document.getElementById("nextLesson");
  var previousButton = document.getElementById("previousLesson");
  var lessonNav = document.getElementById("lessonNav");
  var progressName = document.getElementById("progressName");
  var progressCurrent = document.getElementById("progressCurrent");
  var progressBar = document.getElementById("progressBar");
  var liveRegion = document.getElementById("liveRegion");
  var whyDialog = document.getElementById("whyDialog");

  function format(value, decimals) {
    return Number(Number(value).toFixed(decimals === undefined ? 2 : decimals)).toString();
  }

  function loadProgress() {
    try {
      var saved = JSON.parse(localStorage.getItem("noctis-lab-progress"));
      if (!saved) return;
      state.lesson = Math.min(5, Math.max(0, Number(saved.lesson) || 0));
      state.completed = Math.min(5, Math.max(-1, Number(saved.completed)));
      if (state.lesson > 0 || state.completed >= 0) {
        document.getElementById("enterLab").firstChild.nodeValue = "Resume the lab ";
      }
    } catch (error) {
      return;
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem("noctis-lab-progress", JSON.stringify({
        lesson: state.lesson,
        completed: state.completed
      }));
    } catch (error) {
      return;
    }
  }

  function particles() {
    var points = [
      [17, 18], [35, 30], [53, 15], [73, 37], [82, 18], [27, 55],
      [48, 47], [66, 61], [16, 77], [40, 80], [61, 88], [84, 73]
    ];
    return points.map(function (point) {
      return "<i style='left:" + point[0] + "%;bottom:" + point[1] + "%'></i>";
    }).join("");
  }

  function vialVisual(volume, showLiquid) {
    var liquidHeight = showLiquid ? 8 + (volume / 3) * 60 : 6;
    var readout = showLiquid
      ? "<div class='measurement-readout'><span>LIQUID VOLUME</span><strong id='visualVolume'>" + format(volume, 1) + " mL</strong></div>"
      : "<div class='measurement-readout'><span>STATE</span><strong>DRY</strong></div>";
    return readout +
      "<div class='training-vial'>" +
        "<div class='training-cap'></div>" +
        "<div class='training-glass'>" +
          "<div class='training-liquid' id='trainingLiquid' style='--liquid:" + liquidHeight + "%'></div>" +
          "<div class='particle-field' id='particleField' style='top:auto;height:" + liquidHeight + "%'>" + particles() + "</div>" +
          "<div class='vial-sticker'><small>TRAINING VIAL</small><strong>" + state.vialMg + " mg</strong><span>TOTAL CONTENT</span></div>" +
        "</div>" +
      "</div>";
  }

  function renderVialLesson() {
    return "<div class='visual-panel'>" + vialVisual(0, false) + "</div>" +
      "<div class='lesson-copy'>" +
        "<p class='lesson-index'>01 / VIAL</p>" +
        "<h2>Start with what the label tells you.</h2>" +
        "<p>A vial marked <strong>" + state.vialMg + " mg</strong> contains " + state.vialMg + " mg in total. That number does not yet describe how much is in each milliliter.</p>" +
        "<div class='selector' aria-label='Choose a fictional training vial amount'>" +
          [5, 10, 20].map(function (value) {
            return "<button type='button' data-vial='" + value + "' class='" + (state.vialMg === value ? "is-active" : "") + "'>" + value + " mg</button>";
          }).join("") +
        "</div>" +
        "<div class='key-idea'>Total amount belongs to the vial. Concentration describes the liquid.</div>" +
        "<button class='why-button' type='button' data-why='vial'>Teach me why</button>" +
      "</div>";
  }

  function renderVolumeLesson() {
    var concentration = state.vialMg / state.volume;
    return "<div class='visual-panel'>" + vialVisual(state.volume, true) + "</div>" +
      "<div class='lesson-copy'>" +
        "<p class='lesson-index'>02 / VOLUME</p>" +
        "<h2>Add volume. Watch the relationship change.</h2>" +
        "<p>Move the control. The vial still contains <strong>" + state.vialMg + " mg total</strong>; only the liquid volume and resulting concentration change.</p>" +
        "<div class='range-wrap'>" +
          "<div class='range-labels'><span>0.5 mL</span><span>3.0 mL</span></div>" +
          "<input id='volumeRange' type='range' min='0.5' max='3' step='0.5' value='" + state.volume + "' aria-label='Training liquid volume'>" +
        "</div>" +
        "<div class='relationship-grid'>" +
          "<div><span>Total amount</span><strong id='amountValue'>" + state.vialMg + " mg</strong></div>" +
          "<div><span>Concentration</span><strong id='concentrationValue'>" + format(concentration, 3) + " mg/mL</strong></div>" +
        "</div>" +
        "<div class='equation' id='volumeEquation'>" + state.vialMg + " mg ÷ " + format(state.volume, 1) + " mL = " + format(concentration, 3) + " mg/mL</div>" +
        "<button class='why-button' type='button' data-why='volume'>Why does concentration change?</button>" +
      "</div>";
  }

  function renderConcentrationLesson() {
    return "<div class='visual-panel'>" +
      "<div class='compare-visual'>" +
        "<div class='mini-vial'><div class='mini-bottle' style='--mini-liquid:30%'><div class='training-liquid'></div><b>10 mg</b></div><span>1 mL · 10 mg/mL</span></div>" +
        "<div class='compare-arrow' aria-hidden='true'>↔</div>" +
        "<div class='mini-vial'><div class='mini-bottle' style='--mini-liquid:76%'><div class='training-liquid'></div><b>10 mg</b></div><span>3 mL · 3.33 mg/mL</span></div>" +
      "</div>" +
      "</div>" +
      "<div class='lesson-copy'>" +
        "<p class='lesson-index'>03 / CONCENTRATION</p>" +
        "<h2>Same amount. Different concentration.</h2>" +
        "<p>Concentration is a ratio: <strong>total amount divided by total liquid volume.</strong> The total amount can stay fixed while the concentration changes.</p>" +
        "<div class='equation'>CONCENTRATION = TOTAL AMOUNT ÷ TOTAL VOLUME</div>" +
        "<div class='relationship-grid'>" +
          "<div><span>10 mg ÷ 1 mL</span><strong>10 mg/mL</strong></div>" +
          "<div><span>10 mg ÷ 3 mL</span><strong>3.33 mg/mL</strong></div>" +
        "</div>" +
        "<div class='key-idea'>The unit mg/mL means milligrams per milliliter.</div>" +
        "<button class='why-button' type='button' data-why='concentration'>Teach me why</button>" +
      "</div>";
  }

  function renderSyringeLesson() {
    var units = state.syringeVolume * state.syringeScale;
    var maxVolume = state.syringeScale === 100 ? 1 : 1;
    var fill = Math.min(100, (state.syringeVolume / maxVolume) * 100);
    return "<div class='visual-panel'>" +
      "<div class='syringe-wrap'>" +
        "<div class='syringe'>" +
          "<div class='syringe-needle'></div><div class='syringe-hub'></div>" +
          "<div class='syringe-barrel'><div class='syringe-fluid' id='syringeFluid' style='--fill:" + fill + "%'></div></div>" +
          "<div class='syringe-plunger'></div>" +
        "</div>" +
        "<div class='syringe-caption'>" +
          "<div><span>VOLUME</span><strong id='syringeVolumeReadout'>" + format(state.syringeVolume, 2) + " mL</strong></div>" +
          "<div><span>SYRINGE MARKING</span><strong id='syringeUnitsReadout'>" + format(units, 2) + " units</strong></div>" +
        "</div>" +
      "</div>" +
      "</div>" +
      "<div class='lesson-copy'>" +
        "<p class='lesson-index'>04 / SYRINGE</p>" +
        "<h2>Read markings as volume.</h2>" +
        "<p>A syringe's unit markings describe its calibrated volume scale. They are not milligrams or micrograms of a compound.</p>" +
        "<div class='selector' aria-label='Choose syringe calibration'>" +
          "<button type='button' data-scale='100' class='" + (state.syringeScale === 100 ? "is-active" : "") + "'>U-100</button>" +
          "<button type='button' data-scale='40' class='" + (state.syringeScale === 40 ? "is-active" : "") + "'>U-40</button>" +
        "</div>" +
        "<div class='range-wrap'>" +
          "<div class='range-labels'><span>0.01 mL</span><span>0.50 mL</span></div>" +
          "<input id='syringeRange' type='range' min='0.01' max='0.5' step='0.01' value='" + state.syringeVolume + "' aria-label='Syringe volume'>" +
        "</div>" +
        "<div class='equation' id='syringeEquation'>" + format(state.syringeVolume, 2) + " mL × " + state.syringeScale + " units/mL = " + format(units, 2) + " units</div>" +
        "<div class='key-idea'>Always identify the syringe calibration. Never assume every syringe uses the same scale.</div>" +
        "<button class='why-button' type='button' data-why='syringe'>Teach me why</button>" +
      "</div>";
  }

  function renderVerifyLesson() {
    var steps = [
      ["01", "Name each quantity", "Separate total amount, total volume, concentration, and syringe marking."],
      ["02", "Normalize units", "Convert mg and mcg before comparing or dividing quantities."],
      ["03", "Divide amount by volume", "Total amount ÷ total volume gives concentration."],
      ["04", "Check the result", "Confirm that the answer has the expected units and behaves logically."]
    ];
    return "<div class='visual-panel'>" +
      "<div class='verify-stack'>" +
        steps.map(function (step, index) {
          return "<button class='verify-step" + (index === 0 ? " is-open" : "") + "' type='button' data-verify='" + index + "'>" +
            "<b>" + step[0] + "</b><span><strong>" + step[1] + "</strong><small>" + step[2] + "</small></span>" +
          "</button>";
        }).join("") +
      "</div>" +
      "</div>" +
      "<div class='lesson-copy'>" +
        "<p class='lesson-index'>05 / VERIFY</p>" +
        "<h2>Build a repeatable check.</h2>" +
        "<p>Correct arithmetic can still produce the wrong answer when the quantities were misunderstood. A short verification sequence makes the structure visible.</p>" +
        "<div class='key-idea'>Ask: Does the total amount stay fixed? If volume increases, should concentration go up or down?</div>" +
        "<div class='equation'>AMOUNT ÷ VOLUME = CONCENTRATION</div>" +
        "<button class='why-button' type='button' data-why='verify'>Why verification matters</button>" +
      "</div>";
  }

  function challengeResult() {
    var percent = Math.round((state.score / challenges.length) * 100);
    var message = percent >= 80 ? "Strong understanding." : percent >= 60 ? "The foundation is there." : "Review the relationships once more.";
    return "<div class='visual-panel'>" +
      "<div class='challenge-meta'><p class='eyebrow'>CHALLENGE COMPLETE</p><span class='score'>" + state.score + " / " + challenges.length + "</span></div>" +
      "</div>" +
      "<div class='lesson-copy'>" +
        "<p class='lesson-index'>RESULT / " + percent + "%</p>" +
        "<h2>" + message + "</h2>" +
        "<p>Your score is only a signal. The explanations—and your ability to independently verify the relationship—are what matter.</p>" +
        "<div class='relationship-grid'><div><span>Correct</span><strong>" + state.score + "</strong></div><div><span>Review</span><strong>" + (challenges.length - state.score) + "</strong></div></div>" +
        "<div class='completion-actions'>" +
          "<button class='button button-quiet' type='button' data-retry-challenges>Retry challenge</button>" +
          "<button class='button button-primary' type='button' data-finish-lab>Complete lab →</button>" +
        "</div>" +
      "</div>";
  }

  function renderChallengeLesson() {
    if (state.challenge >= challenges.length) return challengeResult();
    var item = challenges[state.challenge];
    var letters = ["A", "B", "C"];
    var answers = item.answers.map(function (answer, index) {
      var className = "answer";
      if (state.answered && index === item.correct) className += " correct";
      if (state.answered && index === state.selected && index !== item.correct) className += " incorrect";
      return "<button class='" + className + "' type='button' data-answer='" + index + "'" + (state.answered ? " disabled" : "") + "><b>" + letters[index] + "</b><span>" + answer + "</span></button>";
    }).join("");
    var feedback = "";
    if (state.answered) {
      feedback = "<div class='feedback'><strong>" + (state.selected === item.correct ? "Correct." : "Not quite.") + "</strong> " + item.explanation + "</div>" +
        "<button class='button button-primary next-challenge' type='button' data-next-challenge>" + (state.challenge === challenges.length - 1 ? "See results" : "Next question") + " →</button>";
    }
    return "<div class='visual-panel'>" +
      "<div class='challenge-meta'><p class='eyebrow'>" + item.eyebrow + " / " + String(state.challenge + 1).padStart(2, "0") + "</p><span class='score'>" + state.score + " correct</span></div>" +
      "</div>" +
      "<div class='lesson-copy'>" +
        "<p class='lesson-index'>06 / CHALLENGE MODE</p>" +
        "<h2>Test the relationship.</h2>" +
        "<p class='challenge-question'>" + item.question + "</p>" +
        "<div class='answer-grid'>" + answers + "</div>" + feedback +
        "<button class='why-button' type='button' data-why='challenge'>About these questions</button>" +
      "</div>";
  }

  var renderers = [
    renderVialLesson,
    renderVolumeLesson,
    renderConcentrationLesson,
    renderSyringeLesson,
    renderVerifyLesson,
    renderChallengeLesson
  ];

  function renderLesson() {
    stage.classList.toggle("challenge-panel", state.lesson === 5);
    stage.innerHTML = renderers[state.lesson]();
    progressName.textContent = String(state.lesson + 1).padStart(2, "0") + " — " + lessonNames[state.lesson];
    progressCurrent.textContent = state.lesson + 1;
    progressBar.style.width = ((state.lesson + 1) / lessonNames.length * 100) + "%";

    Array.prototype.forEach.call(lessonNav.querySelectorAll("button"), function (button, index) {
      button.classList.toggle("is-active", index === state.lesson);
      button.classList.toggle("is-complete", index <= state.completed);
      if (index === state.lesson) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    });

    previousButton.disabled = state.lesson === 0;
    previousButton.style.opacity = state.lesson === 0 ? ".35" : "1";
    nextButton.hidden = state.lesson === 5;
    nextButton.innerHTML = state.lesson === 4 ? "Begin challenge <span aria-hidden='true'>→</span>" : "Continue <span aria-hidden='true'>→</span>";
    liveRegion.textContent = "Lesson " + (state.lesson + 1) + " of 6: " + lessonNames[state.lesson];
    saveProgress();
  }

  function goToLesson(index, shouldScroll) {
    state.completed = Math.max(state.completed, state.lesson - 1);
    state.lesson = Math.min(5, Math.max(0, index));
    renderLesson();
    if (shouldScroll !== false) {
      lab.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function openWhy(key) {
    var item = whyContent[key];
    if (!item) return;
    document.getElementById("whyTitle").textContent = item.title;
    document.getElementById("whyBody").innerHTML = item.body;
    if (typeof whyDialog.showModal === "function") whyDialog.showModal();
    else whyDialog.setAttribute("open", "");
  }

  function updateVolume(value) {
    state.volume = Number(value);
    var concentration = state.vialMg / state.volume;
    var liquidHeight = 8 + (state.volume / 3) * 60;
    document.getElementById("trainingLiquid").style.setProperty("--liquid", liquidHeight + "%");
    document.getElementById("particleField").style.height = liquidHeight + "%";
    document.getElementById("visualVolume").textContent = format(state.volume, 1) + " mL";
    document.getElementById("concentrationValue").textContent = format(concentration, 3) + " mg/mL";
    document.getElementById("volumeEquation").textContent = state.vialMg + " mg ÷ " + format(state.volume, 1) + " mL = " + format(concentration, 3) + " mg/mL";
  }

  function updateSyringe(value) {
    state.syringeVolume = Number(value);
    var units = state.syringeVolume * state.syringeScale;
    var fill = Math.min(100, state.syringeVolume * 100);
    document.getElementById("syringeFluid").style.setProperty("--fill", fill + "%");
    document.getElementById("syringeVolumeReadout").textContent = format(state.syringeVolume, 2) + " mL";
    document.getElementById("syringeUnitsReadout").textContent = format(units, 2) + " units";
    document.getElementById("syringeEquation").textContent = format(state.syringeVolume, 2) + " mL × " + state.syringeScale + " units/mL = " + format(units, 2) + " units";
  }

  function showCompletion() {
    state.completed = 5;
    saveProgress();
    lab.hidden = true;
    completion.hidden = false;
    completion.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.getElementById("enterLab").addEventListener("click", function () {
    hero.hidden = true;
    completion.hidden = true;
    lab.hidden = false;
    renderLesson();
    lab.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  nextButton.addEventListener("click", function () {
    state.completed = Math.max(state.completed, state.lesson);
    if (state.lesson < 5) goToLesson(state.lesson + 1);
  });

  previousButton.addEventListener("click", function () {
    if (state.lesson > 0) goToLesson(state.lesson - 1);
  });

  lessonNav.addEventListener("click", function (event) {
    var button = event.target.closest("[data-lesson]");
    if (!button) return;
    goToLesson(Number(button.getAttribute("data-lesson")));
  });

  stage.addEventListener("click", function (event) {
    var vialButton = event.target.closest("[data-vial]");
    if (vialButton) {
      state.vialMg = Number(vialButton.getAttribute("data-vial"));
      renderLesson();
      return;
    }

    var scaleButton = event.target.closest("[data-scale]");
    if (scaleButton) {
      state.syringeScale = Number(scaleButton.getAttribute("data-scale"));
      renderLesson();
      return;
    }

    var whyButton = event.target.closest("[data-why]");
    if (whyButton) {
      openWhy(whyButton.getAttribute("data-why"));
      return;
    }

    var verifyButton = event.target.closest("[data-verify]");
    if (verifyButton) {
      Array.prototype.forEach.call(stage.querySelectorAll(".verify-step"), function (button) {
        button.classList.toggle("is-open", button === verifyButton);
      });
      return;
    }

    var answerButton = event.target.closest("[data-answer]");
    if (answerButton && !state.answered) {
      state.selected = Number(answerButton.getAttribute("data-answer"));
      state.answered = true;
      if (state.selected === challenges[state.challenge].correct) state.score += 1;
      renderLesson();
      return;
    }

    if (event.target.closest("[data-next-challenge]")) {
      state.challenge += 1;
      state.answered = false;
      state.selected = null;
      renderLesson();
      return;
    }

    if (event.target.closest("[data-retry-challenges]")) {
      state.challenge = 0;
      state.score = 0;
      state.answered = false;
      state.selected = null;
      renderLesson();
      return;
    }

    if (event.target.closest("[data-finish-lab]")) {
      showCompletion();
    }
  });

  stage.addEventListener("input", function (event) {
    if (event.target.id === "volumeRange") updateVolume(event.target.value);
    if (event.target.id === "syringeRange") updateSyringe(event.target.value);
  });

  document.getElementById("closeDialog").addEventListener("click", function () {
    whyDialog.close();
  });

  whyDialog.addEventListener("click", function (event) {
    var rect = whyDialog.getBoundingClientRect();
    var outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
    if (outside) whyDialog.close();
  });

  document.getElementById("restartLab").addEventListener("click", function () {
    state.lesson = 0;
    state.completed = -1;
    state.challenge = 0;
    state.score = 0;
    state.answered = false;
    state.selected = null;
    try { localStorage.removeItem("noctis-lab-progress"); } catch (error) {}
    completion.hidden = true;
    lab.hidden = false;
    renderLesson();
    lab.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.getElementById("year").textContent = new Date().getFullYear();
  loadProgress();
})();