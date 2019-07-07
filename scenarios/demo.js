var scenes = {};

scenes.welcome = {};

scenes.welcome.start = [
    { text: "Hello again, I'm the 3D avatar," },
    { text: "I can talk and I'm in a scene now, which makes me happy" },
    { text: "I prefer this to being over an i-frame of a wikipedia page." },
    { text: "Did you know I can also do tongue twisters?" },
    { text: "How much wood would a woodchuck chuck, if the woodchuck could chuck wood?" },
    { text: "Well, that's enough of that..."}
];

script = ["welcome"];

module.exports = { script: script, scenes: scenes };