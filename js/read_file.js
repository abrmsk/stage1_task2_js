let func; // function that encloses data from a CSV file

// HTML document object for manipulating access and styles
const inputCsv = document.querySelector('.file_input.csv');
const fileInput = document.querySelector('.file_input.text');

/**
 * Resetting all data to zero, to the initial state of affairs
 */
document.getElementById('resetData').addEventListener('click', () => {
    fileInput.setAttribute('disabled', '');
    fileInput.style.background = 'antiquewhite';
    inputCsv.removeAttribute('disabled');
    inputCsv.value = null;

    deleteAllChildrenHTMLElements(document.getElementById('text_box'))

    function deleteAllChildrenHTMLElements(parent) {
        while(parent.firstChild){
            parent.removeChild(parent.firstChild);
        }
    }
})

/**
 * Reading CSV file. Parsing data and preparing a function for accepting text
 * in which you want to replace the data
 * @param input file with csv markup
 * @returns {Promise <function> | boolean} function with closed data string from csv file
 */
function chooseCsvFile(input) {
    if (input.files.length === 0) return false;

    return new Promise(function (resolve, reject) {

        let file = input.files[0];
        let reader = new FileReader()
        reader.readAsText(file)

        reader.onloadend = () => {
            resolve(reader.result);
        }

        reader.onerror = () => {
            reject(("error: " + reader.error));
        }

    }).then((data) => {

        func = replaceText(data);

        inputCsv.setAttribute('disabled', '');
        fileInput.removeAttribute('disabled');
        fileInput.style.background = '#89f8c2';
    })
}

/**
 * The function accepts alternately CSV file and text files and asynchronously
 * reads data and parses it
 * @param input file 1 - csv, file 2 - in which you need to replace data
 * @returns {Promise <result>} eventually saves the data to the result variable
 */
function replaceData(input) {
    if (input.files.length === 0) return false;

    fileInput.setAttribute('disabled', '');


    for (const file of input.files) {

        new Promise(function (resolve, reject) {
            let reader = new FileReader()

            reader.readAsText(file)

            reader.onloadend = () => {
                resolve(reader.result);
            }

            reader.onerror = () => {
                reject(("error: " + reader.error));
            }

        }).then((data) => {

            return func(data);

        }).then((data) => {

            let elemHTML = document.getElementById('text_box')
            let title = document.createElement('H4')
            title.appendChild(document.createTextNode(`${file.name}`))
            let text = document.createElement('P')
            text.appendChild(document.createTextNode(data))
            elemHTML.appendChild(title)
            elemHTML.appendChild(text)

            fileInput.removeAttribute('disabled');

        }).catch(err => {
            console.error('Error: ' + err);
        });
    }
}

/**
 * The function accepts text in CSV format as input, where there are commas delimited
 * and returns an object with posts sorted by rating.
 * An example of an entry is: 10.20, Kropyvnytsky, 200000
 * Comments in line: #
 * Blank lines are ignored.
 * @param text in CSV format
 * @returns {{}} object of objects, where the key is the name value object with properties
 */
function getRating(text) {
    try {
        return text
            .split("\n")
            .map(e => e.trim())
            .filter(e => (e !== "" && e[0] !== "#"))
            .map(e => e.split(","))
            .map(e => obj = {
                x: e[0],
                y: e[1],
                name: e[2],
                population: e[3]
            })
            .sort((e1, e2) => e2.population - e1.population)
            .slice(0, 3)
            .reduce((total, v, i) => {
                total[v.name] = {
                    population: v.population,
                    rating: i + 1,
                };
                return total;
            }, {})

    } catch (e) {
        console.log(e.error)
    }
}


/**
 * The function accepts text in CSV format as input, where there are commas delimited
 * and returns a function that takes text.
 * This function is replacing the names of objects with the substitution of the properties of this object
 * @param csv text in CSV format
 * @returns {function (*): *} text with substituted data taken from the rating.
 */
let replaceText = (csv) => {

    return function (text) {

        let rating = getRating(csv);

        for (const key in rating) {
            let name = key + "";
            let t = `${name} (${rating[key].rating} место в ТОП-10 самых крупных городов Украины, население ${rating[key].population} человек)`;
            text = text.replaceAll(name, t)
        }
        console.log(text)
        return text;
    }
}