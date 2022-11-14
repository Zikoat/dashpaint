import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { htmlPhaserFunctions } from "./PhaserReactBridge";

export function EditButton() {
  const [isEditing, setIsEditing] = useState(false);

  htmlPhaserFunctions.clickEdit = () => {
    if (isEditing) {
      htmlPhaserFunctions.stopEdit();
    } else {
      htmlPhaserFunctions.startEdit();
    }
    setIsEditing(!isEditing);
    htmlPhaserFunctions.isEditing = !isEditing;
  };

  const pencilColor = isEditing ? "white" : "gray";

  return (
    <button
      style={{
        backgroundColor: "black",
        border: "2px solid white",
        padding: "0.30rem",
        margin: "0.25rem",
      }}
      onClick={htmlPhaserFunctions.clickEdit}
    >
      <FontAwesomeIcon
        icon={faPencil}
        style={{ color: pencilColor }}
        size={"3x"}
      />
    </button>
  );
}
