import './App.css';
import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";

function App() {
  const gameParameters = useGetColumnsAndRows();
  const [gameArrays, updateGameArrays] = useState(makeGameArrays(gameParameters.difficulty, gameParameters.numberOfColumns, gameParameters.numberOfRows));

  function boxClick(clickEvent, rowColumn) {
    const shift = clickEvent.shiftKey;
    const currentClass = clickEvent.target.classList[1];
    const row = parseInt(rowColumn.split("-")[0]);
    const column = parseInt(rowColumn.split("-")[1]);
    const displayArray = gameArrays.displayArray;
    const otherNumberArray = gameArrays.otherNumberArray;
    const bombArray = gameArrays.bombArray;

    if (currentClass === "box-with-flag") {
      if (shift) {
        displayArray[row][column] = -2;
      }
    } else {
      if (otherNumberArray[row][column] === -1 && !shift) {
        Object.keys(otherNumberArray).forEach((bombRow, rowIndex) => {
          Object.keys(otherNumberArray[rowIndex]).forEach((bombColumn, columnIndex) => {
            if (otherNumberArray[rowIndex][columnIndex] === -1) {
              displayArray[rowIndex][columnIndex] = otherNumberArray[rowIndex][columnIndex];
            }
          });
        });
      } else {
        if (shift && currentClass === "blank-box") {
          displayArray[row][column] = -3;
        } else if (displayArray[row][column] === -2 && otherNumberArray[row][column] === 0) {
          function forNumbersInArray(rowToIterate, columnToIterate, arrayOfIds, checkedIds) {
            const negativeOneToOne = [-1, 0, 1];
            negativeOneToOne.forEach((firstNumber) => {
              negativeOneToOne.forEach((secondNumber) => {
                if (!checkedIds.includes(`${rowToIterate + firstNumber}-${columnToIterate + secondNumber}`)) {
                  if (rowToIterate + firstNumber >= 0 && rowToIterate + firstNumber < displayArray.length) {
                    if (columnToIterate + secondNumber >= 0 && columnToIterate + secondNumber < displayArray[rowToIterate].length) {
                      checkedIds.push(`${rowToIterate + firstNumber}-${columnToIterate + secondNumber}`);
                      if (displayArray[rowToIterate + firstNumber][columnToIterate + secondNumber] === -2) {
                        arrayOfIds.push(`${rowToIterate + firstNumber}-${columnToIterate + secondNumber}`);
                        if (otherNumberArray[rowToIterate + firstNumber][columnToIterate + secondNumber] === 0) {
                          forNumbersInArray(rowToIterate + firstNumber, columnToIterate + secondNumber, arrayOfIds, checkedIds);
                        }
                      }
                    }
                  }
                }
              });
            });
            return arrayOfIds;
          };

          const arrayOfIds = forNumbersInArray(row, column, [], []);
          arrayOfIds.forEach((boxId) => {
            const rowToShow = parseInt(boxId.split("-")[0]);
            const columnToShow = parseInt(boxId.split("-")[1]);
            displayArray[rowToShow][columnToShow] = otherNumberArray[rowToShow][columnToShow];
          });

        } else {
          displayArray[row][column] = otherNumberArray[row][column];
        }
      }
    }

    updateGameArrays(() => {
      return {
        bombArray: bombArray,
        displayArray: displayArray,
        otherNumberArray: otherNumberArray
      }
    });
  }

  useEffect(() => {
    setBoxSize(gameParameters.numberOfColumns, gameParameters.numberOfRows);
  });

  return (
    <div className="main-window">
      <Board numberOfRows={gameParameters.numberOfRows} numberOfColumns={gameParameters.numberOfColumns} displayArray={gameArrays.displayArray} buttonClick={boxClick}/>
    </div>
  );
}

function Board(props) {
  const AllRows = [...Array(props.numberOfRows)].map((e, rowNumber) =>
    <Row key={rowNumber} numberOfColumns={props.numberOfColumns} rowNumber={rowNumber} displayRow={props.displayArray[rowNumber]} buttonClick={props.buttonClick}/>
  );
  return (
    <div key="board">
      {AllRows}
    </div>
  );
}

function Row(props) {

  const row = [...Array(props.numberOfColumns)].map((e, columnNumber) =>
    <BombBox key={`${props.rowNumber}-${columnNumber}`} displayNumber={props.displayRow[columnNumber]} rowColumnId={`${props.rowNumber}-${columnNumber}`} buttonClick={props.buttonClick}/>
  );
  return (
    <div className="single-row">
      {row}
    </div>
  );
}

function BombBox(props) {
  const boxClass = props.displayNumber === -3 ? "box-with-flag"
          : props.displayNumber === -2 ? "blank-box"
          : props.displayNumber === -1 ? "box-with-bomb"
          : props.displayNumber === 0 ? "blank-box-clicked"
          : "box-with-number";
  const boxNumber = props.displayNumber === -3 ? ""
          : props.displayNumber === -2 ? ""
          : props.displayNumber === -1 ? ""
          : props.displayNumber === 0 ? ""
          : `${props.displayNumber}`;
  return (
    <div className={["bomb-box", boxClass].join(' ')} onClick={(event) => { props.buttonClick(event, props.rowColumnId) }}>{boxNumber}</div>
  );
};

function useGetColumnsAndRows() {
  const location = useLocation();
  const hash = location.hash.slice(1);
  const partsOfHash = hash.split(":");
  let difficulty;
  let numberOfColumns;

  if (partsOfHash[0] === "easy" || partsOfHash[0] === "medium" || partsOfHash[0] === "hard") {
    difficulty = partsOfHash[0];
  } else {
    difficulty = "medium";
  }

  if (isNaN(parseInt(partsOfHash[1]))) {
    numberOfColumns = 30;
  } else {
    numberOfColumns = Math.round(parseInt(partsOfHash[1]));
  }

  const numberOfRows = Math.round(numberOfColumns / 2);

  return {
    difficulty,
    numberOfColumns,
    numberOfRows
  }

}

function makeGameArrays(difficulty, c, r) {
  let arrayMultiplyer;

  if (difficulty === "easy") {
    arrayMultiplyer = 0.6;
  } else if (difficulty === "medium") {
    arrayMultiplyer = 0.7;
  } else if (difficulty === "hard") {
    arrayMultiplyer = 1.1;
  }
  const bombArray = [...Array(r)].map(() => [...Array(c)].map(() => Math.round(Math.random() * arrayMultiplyer)));
  const displayArray = [...Array(r)].map(() => [...Array(c)].map(() => -2));
  const otherNumberArray = [...Array(r)].map((e, rowNumber) => [...Array(c)].map(function(e, columnNumber) {
    let numberForArray = 0;
    if (bombArray[rowNumber][columnNumber] === 0) {

      numberForArray += rowNumber - 1 >= 0 && columnNumber - 1 >= 0 ? bombArray[rowNumber - 1][columnNumber - 1] : 0;
      numberForArray += rowNumber - 1 >= 0 ? bombArray[rowNumber - 1][columnNumber] : 0;
      numberForArray += rowNumber - 1 >= 0 && columnNumber + 1 < c ? bombArray[rowNumber - 1][columnNumber + 1] : 0;
      numberForArray += columnNumber - 1 >= 0 ? bombArray[rowNumber][columnNumber - 1] : 0;
      numberForArray += columnNumber + 1 < c ? bombArray[rowNumber][columnNumber + 1] : 0;
      numberForArray += rowNumber + 1 < r && columnNumber - 1 >= 0 ? bombArray[rowNumber + 1][columnNumber - 1] : 0;
      numberForArray += rowNumber + 1 < r ? bombArray[rowNumber + 1][columnNumber] : 0;
      numberForArray += rowNumber + 1 < r && columnNumber + 1 < c ? bombArray[rowNumber + 1][columnNumber + 1] : 0;
    } else {
      numberForArray = -1;
    }
    return numberForArray;
  }
  ));

  return {
    bombArray,
    displayArray,
    otherNumberArray
  };
}

function setBoxSize(numberOfColumns, numberOfRows) {
  const elements = document.getElementsByClassName('bomb-box');
  console.log("setting size")
  for (const element of elements) {
    element.style.width = `calc((100vw / ${numberOfColumns}) - 1px)`;
    element.style.height = `calc((100vh / ${numberOfRows}) - 1px)`;
  }
}


export default App;
