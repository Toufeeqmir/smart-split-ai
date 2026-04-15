import  React from "react";

export default function Button({text , onClick, type = "primary"}){
  const base = "px-4 py-2 rounded-lg font-medium transition";

  const styles ={
    primary:"bg-blue-500 text-white hover:bg-blue-600",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    danger:"bg-red-500 text-white hover:bg-red-600",
  };

  return (
    <button onClick = {onClick} className= {`${base} ${styles [type]}`}
   > {text}</button>
  )
}