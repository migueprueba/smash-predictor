
### **Technical Specification: Match Prediction Preprocessing (Manual WR Entry)**

**Objective:** Convert 5 user inputs into a 7-element numerical array (`rawMatchData`) for the logistic regression model.

**1. Input Fields Required in UI:**
* **Player 1 Character** (Dropdown)
* **Player 2 Character** (Dropdown)
* **Stage** (Dropdown)
* **Player 1 Win Rate** (Numeric Input, e.g., 0.58)
* **Player 2 Win Rate** (Numeric Input, e.g., 0.35)

**2. Transformation Logic (JavaScript):**
The character and stage selections must be converted to integers using the mapping, while the "Power" values are looked up based on the character choice. The Win Rates are taken directly from the user.

```javascript
/**
 * @param {Object} input - Contains p1_char, p2_char, stage, p1_wr, p2_wr
 * @param {Object} assets - The JSON containing 'chars', 'stages', and 'char_power'
 */
function prepareRawMatchData(input, assets) {
    // 1. Convert names to Encodings
    const p1_char_int = assets.chars[input.p1_char];
    const p2_char_int = assets.chars[input.p2_char];
    const stage_int = assets.stages[input.stage];
    
    // 2. Lookup Character Power Index (static based on character choice)
    const p1_power = assets.char_power[input.p1_char] || 0.5;
    const p2_power = assets.char_power[input.p2_char] || 0.5;
    
    // 3. Use Manual User Input for Player Win Rates
    const p1_player_wr = parseFloat(input.p1_wr);
    const p2_player_wr = parseFloat(input.p2_wr);

    // CRITICAL: The array MUST maintain this exact order for the scaler:
    return [
        p1_char_int,    // index 0
        p2_char_int,    // index 1
        stage_int,      // index 2
        p1_power,       // index 3
        p2_power,       // index 4
        p1_player_wr,   // index 5
        p2_player_wr    // index 6
    ];
}
```

**3. Data Order Reference Table:**
| Index | Feature | Source |
| :--- | :--- | :--- |
| 0 | `p1_char_int` | `assets.chars` lookup |
| 1 | `p2_char_int` | `assets.chars` lookup |
| 2 | `stage_int` | `assets.stages` lookup |
| 3 | `p1_power` | `assets.char_power` lookup |
| 4 | `p2_power` | `assets.char_power` lookup |
| 5 | `p1_player_wr` | **User Manual Input** |
| 6 | `p2_player_wr` | **User Manual Input** |

---

Yo should include your scaling logic and the model output (from m2cgen):

```javascript
// Pipeline execution
function onPredictClick() {
    const userInput = {
        p1_char: document.getElementById('p1_char').value,
        p2_char: document.getElementById('p2_char').value,
        stage: document.getElementById('stage').value,
        p1_wr: document.getElementById('p1_wr').value,
        p2_wr: document.getElementById('p2_wr').value
    };

    const rawData = prepareRawMatchData(userInput, modelAssets);
    const scaledData = manualScale(rawData); // Uses the mean/std you provided
    const probability = score(scaledData);   // This is the m2cgen function
    
    displayResult(probability);
}
```

```javascript
const scalerParams = {

"mean": [43.188686735031425,

42.3562686073437,

6.528183923255044,

0.8389546409660315,

0.8325336102071212,

0.536284330837661,

0.49802305707848504],

"std": [25.004168842533055,

25.11383608796598,

2.666360238263281,

0.0935927489475468,

0.0931511800134774,

0.09757633849878941,

0.1070710967320812]

};


function manualScale(inputArray) {

return inputArray.map((value, i) => {

return (value - scalerParams.mean[i]) / scalerParams.std[i];

});

}


// How to run the whole pipeline:

function predictWinner(rawMatchData) {

// 1. Scale the data first

const scaledData = manualScale(rawMatchData);


// 2. Call the m2cgen function (usually named 'score' by default)

const result = score(scaledData);


return result >= 0.5 ? "Player 1 wins" : "Player 2 wins";

}
```
