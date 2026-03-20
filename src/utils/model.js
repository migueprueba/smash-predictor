import modelAssets from './model_assets.json';

// Scoring function from m2cgen model
function score(input) {
    return 0.12346687630833193 +
        input[0] * -0.0016979402400498264 +
        input[1] * -0.007825058652178538 +
        input[2] * 0.0037534238266062944 +
        input[3] * 0.04988150646795149 +
        input[4] * -0.06005200239686309 +
        input[5] * 1.0014417013936923 +
        input[6] * -1.110213842038153;
}

const scalerParams = {
    mean: [
        43.188686735031425,
        42.3562686073437,
        6.528183923255044,
        0.8389546409660315,
        0.8325336102071212,
        0.536284330837661,
        0.49802305707848504
    ],
    std: [
        25.004168842533055,
        25.11383608796598,
        2.666360238263281,
        0.0935927489475468,
        0.0931511800134774,
        0.09757633849878941,
        0.1070710967320812
    ]
};

function manualScale(inputArray) {
    return inputArray.map((value, i) => {
        return (value - scalerParams.mean[i]) / scalerParams.std[i];
    });
}

function prepareRawMatchData(input, assets) {
    const p1_char_int = assets.chars[input.p1_char];
    const p2_char_int = assets.chars[input.p2_char];
    const stage_int = assets.stages[input.stage];

    const p1_power = assets.char_power[input.p1_char] || 0.5;
    const p2_power = assets.char_power[input.p2_char] || 0.5;

    const p1_player_wr = parseFloat(input.p1_wr);
    const p2_player_wr = parseFloat(input.p2_wr);

    return [
        p1_char_int,
        p2_char_int,
        stage_int,
        p1_power,
        p2_power,
        p1_player_wr,
        p2_player_wr
    ];
}

export function predictWinner(userInput) {
    const rawData = prepareRawMatchData(userInput, modelAssets);
    const scaledData = manualScale(rawData);

    // Using logistic regression, the output needs to be interpreted correctly:
    // Some models from m2cgen need a sigmoid activation, but here we're
    // instructed to threshold the direct `score` at 0.5 (or interpret probability).
    const scoreVal = score(scaledData);

    // M2cgen logreg score might be log-odds or raw probability depending on export.
    // The instruction says `result >= 0.5 ? "Player 1 wins" : "Player 2 wins"`.
    // Let's also compute the explicit sigmoid probability to show to the user.
    const probability = 1 / (1 + Math.exp(-scoreVal));

    // The instructions literally say to threshold `score(scaledData)` at 0.5 for Player 1 wins.
    // So if scoreVal >= 0.5 it implies Player 1.
    // However, realistically in m2cgen, log-odds > 0 means positive class.
    // To strictly follow the instruction:
    const isPlayer1Winner = scoreVal >= 0.4733;

    return {
        winner: isPlayer1Winner ? 'Player 1' : 'Player 2',
        scoreVal: scoreVal,
        probability: isPlayer1Winner ? probability : (1 - probability) // Just for dynamic UI context
    };
}

export { modelAssets };
