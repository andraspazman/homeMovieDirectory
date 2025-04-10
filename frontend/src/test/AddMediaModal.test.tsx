/// <reference types="vitest" />


/*  //The purpose of the test is to:

    - does it actually try to send the data

    - the component respond properly, such as closing itself
*/

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChakraProvider } from "@chakra-ui/react";
import { AddMediaModal } from "../../src/components/AddContentForms/AddMediaForm";
import axios from "axios";
import { describe, expect, it, vi } from "vitest";

// Mock the axios post call
vi.mock("axios");

describe("AddMediaModal component", () => {
  it("successfully sends the selected form", async () => {

    // Mock axios.post to return a successful response
    (axios.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ data: {} });
    const onClose = vi.fn();

    //rendering the components
    render(
      <ChakraProvider>
        <AddMediaModal isOpen={true} onClose={onClose} />
      </ChakraProvider>
    );

    // Check if the modal header contains "Add new Series"
    expect(screen.getByText(/Add new series/i)).toBeInTheDocument();

    // Fill out the form fields, simulating fill fields

    //Title
    const titleInput = screen.getByPlaceholderText("Title");
    await userEvent.type(titleInput, "Test Series");

    //  Select Genre
    const genreSelect = screen.getByRole("combobox", { name: /genre/i });
    userEvent.selectOptions(genreSelect, "Action");

    //Select Release Year 
    const releaseYearSelect = screen.getByRole("combobox", { name: /release year/i });
    userEvent.selectOptions(releaseYearSelect, "2023");

    // Fill in Description
    const descriptionTextArea = screen.getByPlaceholderText("Description");
    await userEvent.type(descriptionTextArea, "This is a test description.");

    // Select Language
    const languageSelect = screen.getByRole("combobox", { name: /language/i });
    userEvent.selectOptions(languageSelect, "English");


    // Submit the form using the "Save" button:
    const saveButton = screen.getByRole("button", { name: /Save/i });
    userEvent.click(saveButton); //send form

    // Wait for the form to be successfully submitted and the modal to close
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });

    // Optionally verify that axios.post was called with the correct parameters
    expect(axios.post).toHaveBeenCalledWith(
      "https://localhost:7204/series",
      expect.any(FormData),
      expect.objectContaining({
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
  });


});
