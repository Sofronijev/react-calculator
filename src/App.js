import React from 'react';
import './App.scss';

function Display(props) {
  return (
    <div className="display">
      <p id="preview">{props.formula}</p>
      <p id="display">{props.result}</p>
    </div>
  );

}

function Buttons(props) {
  return (
    <div className="buttons">
      <button onClick={props.handleClear} id="clear">AC</button>
      <button className="operator" onClick={props.handleOperators} id="divide">/</button>
      <button className="operator" onClick={props.handleOperators} id="multiply">*</button>
      <button onClick={props.handleNumber} id="seven">7</button>
      <button onClick={props.handleNumber} id="eight">8</button>
      <button onClick={props.handleNumber} id="nine">9</button>
      <button className="operator" onClick={props.handleOperators} id="subtract">-</button>
      <button onClick={props.handleNumber} id="four">4</button>
      <button onClick={props.handleNumber} id="five">5</button>
      <button onClick={props.handleNumber} id="six">6</button>
      <button className="operator" onClick={props.handleOperators} id="add">+</button>
      <button onClick={props.handleNumber} id="one">1</button>
      <button onClick={props.handleNumber} id="two">2</button>
      <button onClick={props.handleNumber} id="three">3</button>
      <button onClick={props.handleEqual} id="equals">=</button>
      <button onClick={props.handleNumber} id="zero">0</button>
      <button onClick={props.handleDecimal} id="decimal">.</button>

    </div>
  );
}

const negativeSignLast = /-$/;
const endsWithOperator = /[*+/-]$/;
const endsWithNegativeSign = /[*/+]-$/;
const endsWithNumberDot = /[0-9.]$/;
const endsWithZeroAfterOperator = /[*/+-]0$/;


class App extends React.Component {
  state = {
    formula: "",
    result: "0",
    evaluated: false,
    maxNumber: false
  }  

  handleNumber = (e) => {
    if (!this.state.maxNumber) {
      let character = e.target.innerText;
      if (!this.state.evaluated) {
        //checks if we clicked on 0 and first character of result is 0 and not decimal, then we dont type anymore 0
        if (character === "0" && (this.state.result.slice(0, 1) === "0" && !this.state.result.includes("."))) {
          return;
          //if formula ends with operator and 0 (+0) or formula contains only 0, removes last character and adds the one we clicked (not 0)
        } else if (endsWithZeroAfterOperator.test(this.state.formula) || this.state.formula === "0") {
          this.setState({
            formula: this.state.formula.slice(0, -1) + character,
            result: this.state.result.slice(0, -1) + character
          });
          //in all other cases just adds character, for results checks if its a new number
        } else {
          this.setState({
            formula: this.state.formula + character,
            // if formula ends with number or dot ,concats text, else creates new result
            result: (endsWithNumberDot.test(this.state.formula) ? this.state.result + character : character)
          }, () => {
            //limit number length (this is best place to use function because it counts length right after updating)
            if (this.state.result.length >= 16) {
              this.setState({
                maxNumber: true
              });
            }
          });
        }

      } else {
        this.setState({
          formula: character,
          result: character,
          evaluated: false,
          maxNumber: false,
        });
      }
    }
  }

  handleOperators = (e) => {
    let operator = e.target.innerText;
    let formula = this.state.formula;
    if (!this.state.evaluated) {
      this.setState({
        maxNumber: false
      })
      //clicked operator
      //if formula is empty and doesnt end with '-' and selected operator is '-', adds '-' to end
      if ((formula === "" || !negativeSignLast.test(formula)) && operator === "-") {
        this.setState({
          formula: formula + operator
        });
        //if formula isnt empty and doesnt end with operator adds clicked operator '+ * /'
      } else if (formula !== "" && !endsWithOperator.test(formula)) {
        this.setState({
          formula: formula + operator
        });
        //if formula ends with negative sign and some other [+/*]-, and clicked operator is not '-', removes last 2 operator and adds new one
        // formula: 9*- 
        //clicked: +
        // new formula: 9+
      } else if (endsWithNegativeSign.test(formula) && operator !== "-") {
        this.setState({
          formula: formula.slice(0, -2) + operator
        });
        // if formula ends with operator and its not only character in formula, removes last operator and adds new one
        //formula: 9*
        //clicked: /
        //new formula: 9-
      } else if (endsWithOperator.test(formula) && formula.length !== 1) {
        this.setState({
          formula: formula.slice(0, -1) + operator
        });
      }
      //if result is evaluated, result becomes formula and adds clicked operator
    } else {
      this.setState({
        formula: this.state.result + operator,
        evaluated: false,
        maxNumber: false
      });
    }
  }
  handleDecimal = (e) => {
    if (this.state.evaluated) {
      this.setState({
        formula: "0.",
        result: "0.",
        evaluated: false
      })
    } else {
      console.log(endsWithOperator.test(this.state.formula))
      if (this.state.result.includes(".") && !endsWithOperator.test(this.state.formula)) {
        return;
      } else if (this.state.formula === "") {
        this.setState({
          formula: "0.",
          result: "0."
        });
      } else if (endsWithOperator.test(this.state.formula)) {
        this.setState({
          formula: this.state.formula + "0" + e.target.innerText,
          result: "0" + e.target.innerText
        });
      } else {
        this.setState({
          formula: this.state.formula + e.target.innerText,
          result: this.state.result + e.target.innerText
        });
      }
    }
  }
  handleClear = () => {
    this.setState({
      formula: "",
      result: "0",
      evaluated: false,
      maxNumber: false
    })
  }
  //evaluating using eval function
  handleEqual = () => {
    let formula = this.state.formula;
    //if its already calculated it doesnt work
    if (this.state.evaluated || this.state.formula === "") {
      return;
    }
    //while there is operator at end, removes it
    while (endsWithOperator.test(formula)) {
      formula = formula.slice(0, -1);
    }
    if (formula === "") {
      return;
    }
    this.setState({
      formula: formula + '=' + Math.round(1000000000000 * eval(formula)) / 1000000000000,
      result: Math.round(1000000000000 * eval(formula)) / 1000000000000,
      evaluated: true,
      maxNumber: false
    })
  }
  //evaluating whitout eval function
  handleEqualNoEval = () => {
    let formula = this.state.formula;
    if (this.state.evaluated || this.state.formula === "") {
      return;
    }
    //while there is operator at end, removes it
    while (endsWithOperator.test(formula)) {
      formula = formula.slice(0, -1);
    }
    if (formula === "") {
      return;
    }
    let splitFormula = formula.match(/[\d.]+|\D+/g);

    //RECURSION
    //checks for multiply and divison 
    const checkForMultyOrDev = (formula) => {
      let number = 0;
      if (!formula.some(part => { return part.includes("*") || part.includes("/") })) {
        return formula;
      }
      for (let i = 0; i < formula.length; i++) {
        if (formula[i].includes("*") || formula[i].includes("/")) {
          switch (formula[i]) {
            case "*":
              number = parseFloat(formula[i - 1]) * parseFloat(formula[i + 1]);
              break;
            case "*-":
              number = parseFloat(formula[i - 1]) * - parseFloat(formula[i + 1]);
              break;
            case "/":
              number = parseFloat(formula[i - 1]) / parseFloat(formula[i + 1]);
              break;
            case "/-":
              number = parseFloat(formula[i - 1]) / - parseFloat(formula[i + 1]);
              break;
          }
          //need to transform number to string so i dont get error when function runs another time
          formula.splice(i - 1, 3, number.toString());
          //i resets to 0 so it always starts from begining of formula
          i = 0;
        }
      }
      return checkForMultyOrDev(formula);
    }
    //RECURSION
    //Checks for add and subtract
    const checkForAddOrSub = (formula) => {
      let number = 0;
      if (!formula.some(part => { return part.includes("+") || part.includes("-") }) || formula.length === 1) {
        return formula;
      }
      for (let i = 0; i < formula.length; i++) {
        if (formula[i].includes("+") || formula[i].includes("-")) {
          switch (formula[i]) {
            case "+":
              number = parseFloat(formula[i - 1]) + parseFloat(formula[i + 1]);
              break;
            case "+-":
              number = parseFloat(formula[i - 1]) + - parseFloat(formula[i + 1]);
              break;
            case "-":
              // if we find - and its first element in array then we just create negative number from next element in array
              //example: ["-", "9", "+", "9"]  => -1 * 9 => -9 => ["-9", "+", "9"]
              if (formula[i - 1] !== undefined) {
                number = parseFloat(formula[i - 1]) - parseFloat(formula[i + 1]);
              } else {
                number = -1 * parseFloat(formula[i + 1]);
              }
              break;
          }
          //need to transform number to string so i dont get error when function runs another time
          // if i === 0 , then - is first element and splice needs to change
          i === 0 ? formula.splice(i, 2, number.toString()) : formula.splice(i - 1, 3, number.toString());
          i = 0;
        }
      }
      return checkForAddOrSub(formula);
    }

    let formulaAfterMultyAndDev = checkForMultyOrDev(splitFormula);
    let finalResult = checkForAddOrSub(formulaAfterMultyAndDev);

    this.setState({
      //math.round is for decimal numbers, js can make problems
      formula: formula + '=' + Math.round(1000000000000 * finalResult) / 1000000000000,
      result: Math.round(1000000000000 * finalResult) / 1000000000000,
      evaluated: true,
      maxNumber: false
    });
  }
  render() {
    return (
      <div className="App">
        <Display
          formula={this.state.formula}
          result={this.state.result}
        />
        <Buttons
          handleNumber={this.handleNumber}
          handleOperators={this.handleOperators}
          handleDecimal={this.handleDecimal}
          handleClear={this.handleClear}
          //Select what function to use for equation
          //handleEqual={this.handleEqual}
          handleEqual={this.handleEqualNoEval}
        />
      </div>
    );
  }

}

export default App;
