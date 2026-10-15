import { TareaView } from "./views/TareaView.js";
import { TareaModel } from "./models/TareaModel.js";
import { StorageService } from "./services/StorageService.js";
import { TareaController } from "./controllers/TareaController.js";
document.addEventListener("DOMContentLoaded", () => {
    new TareaController(new TareaView(), new TareaModel(new StorageService()));
});
