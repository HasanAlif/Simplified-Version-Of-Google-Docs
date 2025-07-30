import { Extension } from "@tiptap/react";
import "@tiptap/extension-text-style";

// This extension provides functionality to manage font size in text nodes
// It allows setting a specific font size for text nodes and provides commands to set or unset the font size
declare module "@tiptap/core" {
// Extend the Tiptap core module to include font size commands
  // This allows components to use these commands to modify the font size of text nodes in the editor
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType; // The `setFontSize` command sets the font size for the selected text nodes
      // It takes a string parameter representing the desired font size
      unsetFontSize: () => ReturnType; // The `unsetFontSize` command resets the font size to the default value
      // This allows the font size to be removed from the selected text nodes
    };
  }
}

// Extend the Tiptap core module to include font size commands
// This extension adds support for font size in text nodes
export const FontSizeExtension = Extension.create({
  name: "fontSize",
  // The name of the extension, used to identify it in the editor
  // This extension will apply to text nodes, allowing font size adjustments for these types
  addOptions() {
    return {
      types: ["textStyle"], // Specify the node types that this extension will apply to
      // The extension will apply to textStyle nodes, allowing font size adjustments for these types
    };
  },// The `addOptions` method allows customization of the extension's behavior
  // It defines the node types that will be affected by this extension

  addGlobalAttributes() { // This method adds global attributes to the specified node types
    // It allows the extension to modify the attributes of text nodes globally
    return [
      {
        types: this.options.types, // Apply the attributes to the specified node types
        // The attributes will be applied to textStyle nodes as defined in the options
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize, // Parse the font size from the HTML element's style attribute
            // This allows the extension to read the font size from existing HTML elements and apply it
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {}; // If no font size is set, return an empty object to avoid adding unnecessary attributes
                // This prevents the extension from adding a font-size attribute if it is not explicitly set
              }

              return {
                style: `font-size: ${attributes.fontSize}`, // Render the font size as a style attribute in the HTML output
                // This allows the font size to be applied in the rendered HTML, affecting the appearance of the text
                // The font size will be applied to the text nodes in the editor, affecting their appearance
              };
            },
          },
        },
      },
    ];
  },

  // This method adds global attributes to the specified node types
  // It allows the extension to modify the attributes of text nodes globally
  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }) => {
          return chain().setMark("textStyle", { fontSize }).run(); // Set the font size for the selected text nodes
          // This command applies the specified font size to the selected text nodes in the editor
        },
      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain()
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle.arguments(); // Unset the font size for the selected text nodes
          // This command removes the font size from the selected text nodes, resetting it to the default
        },
    };
  },
});
