type GlobalFunctions = {
    startEdit: () => void;
    clickEdit: () => void;
    stopEdit: () => void;
    loadFinished: () => void;
    isEditing: boolean;
    clickReset: () => void;
  };
  
  function defaultImplementation() {
    throw new Error("game not started yet");
  }
  
  export let htmlPhaserFunctions: GlobalFunctions = {
    clickEdit: defaultImplementation,
    stopEdit: defaultImplementation,
    startEdit: defaultImplementation,
    loadFinished: defaultImplementation,
    isEditing: false,
    clickReset: defaultImplementation,
  };
  