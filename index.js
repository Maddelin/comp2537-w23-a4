async function getRandomPokemons(numberOfPairs) {
    // limit random pokemons to first 810
    const max = 810
    const min = 1
    let randomIDList = []
    for (let i = 0; i < numberOfPairs; i++) {
        // generate random pokemons IDs
        const randomID = Math.floor(Math.random() * (max - min + 1) + min)
        console.log(randomID)

        // check if ID already exists in list
        if (randomIDList.includes(randomID)) {
            i--
            continue
        } else {
            // randomly insert into list twice for matching pairs
            randomIDList.splice(Math.floor(Math.random() * numberOfPairs), 0, randomID)
            randomIDList.splice(Math.floor(Math.random() * numberOfPairs), 0, randomID)
        }
    }
    console.log(randomIDList)
    // empty grid
    $("#game_grid").empty()

    // add to grid
    for (let i = 0; i < numberOfPairs * 2; i++) {
        $('#game_grid').append(`
            <div id="card${i}" class="card single">
                <img id="img${i}" class="front_face" 
                    src=
                    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${randomIDList[i]}.png" alt="Pokemon official artwork">
                <img class="back_face" 
                    src=
                    "back.webp" alt="Pokeball">
            </div>
        `)

    }
}

const setup = async () => {
    let numberOfPairs = 3
    let pairsLeft = numberOfPairs
    let duration = 100

    let moves = 0
    let correct = 0

    let firstCard = undefined
    let secondCard = undefined

    let timeRemaining = duration;
    let timer;

    const startTimer = (duration) => {
        clearInterval(timer);
        timeRemaining = duration;
        updateTimer();

        timer = setInterval(() => {
            timeRemaining--;
            updateTimer();

            if (timeRemaining <= 0 || parseInt($("#numberOfPairsLeft").text()) === 0) {
                clearInterval(timer);
                if (parseInt($("#numberOfPairsLeft").text()) === 0) {
                    alert("Congratulations! You won!");
                } else {
                    alert("Time's up! You lost!");
                }
            } else if (timeRemaining === Math.floor(duration / 2)) {
                alert("You're halfway there! Here's a little help!");
                powerUp();
            }
        }, 1000);
    };

    const updateTimer = () => {
        const seconds = timeRemaining;
        $("#timer").text(`${seconds.toString().padStart(2, "0")}`);
    };

    $(".difficulty").on('click', 'input', async (event) => {
        console.log(event.target.id)
        if (event.target.id === "easy") {
            numberOfPairs = 3
            duration = 100
        } else if (event.target.id === "medium") {
            numberOfPairs = 6
            duration = 200
        } else if (event.target.id === "hard") {
            numberOfPairs = 12
            duration = 300
        }
        console.log(numberOfPairs)
        await getRandomPokemons(numberOfPairs)
        pairsLeft = numberOfPairs
        $(".card").off("click").on("click", clickCard);

        $("#numberOfPairsTotal").text(numberOfPairs)
        $("#numberOfPairsLeft").text(pairsLeft)
    })
    await getRandomPokemons(numberOfPairs)


    $("#start_game").on(("click"), function () {
        $("#game_environment").removeAttr("hidden")
        $("#game_header").removeAttr("hidden")
        $("#start_game").attr("hidden", true)
        startTimer(duration);
    })

    $("#reset_game").on(("click"), async function () {
        $("#start_game").removeAttr("hidden")
        $("#game_environment").attr("hidden", true)
        $("#game_header").attr("hidden", true)
        $("input[type=radio]").prop("checked", false);
        $("#easy").prop("checked", true);
        clearInterval(timer);
        $("#timer").text("");
        numberOfPairs = 3
        duration = 100
        pairsLeft = numberOfPairs
        moves = 0
        correct = 0
        firstCard = undefined
        secondCard = undefined
        $("#numberOfPairsTotal").text(numberOfPairs)
        $("#numberOfPairsLeft").text(pairsLeft)
        $("#numberOfClicks").text(moves)
        $("#numberOfMatches").text(correct)
        await getRandomPokemons(numberOfPairs)
        $(".card").off("click").on("click", clickCard);

    })

    $("#darkModeToggle").on("click", (event) => {
        if (event.target.checked) {
            console.log("dark mode")
            $("body").addClass("dark_body")
            $("#game_grid").addClass("dark_grid")
        } else {
            $("body").removeClass("dark_body")
            $("#game_grid").removeClass("dark_grid")
        }
    })

    const flipCard = () => {
        return function () {

            // Do nothing if the card is already matched, flipped, or two cards are already flipped
            if ($(this).hasClass("matched") || $(this).hasClass("flip") || secondCard) {
                return;
            }

            $(this).toggleClass("flip");
            moves++
            console.log(moves)
            $("#numberOfClicks").text(moves)

            if (!firstCard) {
                firstCard = $(this);
            } else {
                secondCard = $(this);
                checkMatch();
            }
        };
    };

    const checkMatch = () => {
        const firstCardID = firstCard.attr("id");
        const secondCardID = secondCard.attr("id");

        if (firstCardID === secondCardID) {
            return; // Do nothing if the user clicked on the same card twice
        }

        const firstCardImg = firstCard.find(".front_face").attr("src");
        const secondCardImg = secondCard.find(".front_face").attr("src");

        if (firstCardImg === secondCardImg) {
            correct++;
            pairsLeft--;

            $("#numberOfMatches").text(correct);
            $("#numberOfPairsLeft").text(pairsLeft);

            firstCard.addClass("matched");
            secondCard.addClass("matched");

            firstCard.removeClass("single");
            secondCard.removeClass("single");

            firstCard.off("click");
            secondCard.off("click");

            firstCard = undefined;
            secondCard = undefined;

            if (pairsLeft === 0) {
                clearInterval(timer);
                alert("Congratulations! You won!");
            }
        } else {
            setTimeout(() => {
                firstCard.removeClass("flip");
                secondCard.removeClass("flip");

                firstCard = undefined;
                secondCard = undefined;
            }, 1000);
        }
    };

    const clickCard = flipCard()

    const powerUp = () => {
        // flip all single cards for 750ms
        $(".single:not(.flip)").toggleClass("flip")
        setTimeout(() => {
            $(".single").removeClass("flip")
            firstCard = undefined;
            secondCard = undefined;
            $(".single").on("click", clickCard);
        }, 750);
    }


    $("#game_grid").on("click", ".single", clickCard);
}

$(document).ready(setup)
