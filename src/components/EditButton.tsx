import React, { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { MyContext } from "./DashPaintPage";

export function EditButton() {
  const { isEditing, mutateEditing } = useContext(MyContext);

  function toggleEdit() {
    mutateEditing(!isEditing);
  }

  const pencilColor = isEditing ? "white" : "gray";

  return (
    <button
      style={{
        backgroundColor: "black",
        border: "2px solid white",
        padding: "0.30rem",
        margin: "0.25rem",
      }}
      onClick={toggleEdit}
    >
      <FontAwesomeIcon
        icon={faPencil}
        style={{ color: pencilColor }}
        size={"3x"}
      />
    </button>
  );
}
