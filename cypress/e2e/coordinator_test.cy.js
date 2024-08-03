describe("Coordinator Path Test", () => {
  it("successfully loads", () => {
    cy.viewport(1280, 720);
    //login
    cy.visit("http://localhost:3333/login");
    cy.get("input#email").type("coor_1@ad.au");

    cy.get("input#password").type("admin123");

    cy.get("button#buttonLogin").click();

    // to myproject
    cy.contains("a.nav-link", "My Project").click({ force: true });
    cy.url().should("include", "/project/myproject");
    cy.wait(2000);
    cy.contains("button", "+ Create Project").click();
    cy.url().should("include", "/project/create");

    const projectName = "New Project Title";
    cy.get("input#title").type("New Project Title");
    cy.get("select#field").select("Artificial Intelligence");
    cy.get("textarea#description").type(
      "This is a description of the new project."
    );
    cy.get("input#email").type("client_1@ad.au");
    cy.get("input#requiredSkills").type("Skill 1, Skill 2");
    cy.get("input#maxTeams").type("5");

    const fileName = "P37 - Capstone Projects Management Platform.pdf";
    cy.fixture(fileName).then((fileContent) => {
      cy.get("input#file").attachFile({
        fileContent: fileContent.toString(),
        fileName: fileName,
        mimeType: "application/pdf",
      });
    });
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/project/myproject");
    cy.wait(2000);

    // cy.contains(".custom-card-title", projectName).should("be.visible").click();
    // cy.url().should("include", `/project/details/`);

    // cy.contains("a", "Click here to download the project specification")
    //   .should("have.attr", "href")
    //   .then((href) => {
    //     cy.request(href).then((response) => {
    //       expect(response.status).to.eq(200);
    //       expect(response.headers["content-type"]).to.eq("application/pdf");
    //     });
    //   });
    // cy.wait(2000);

    // cy.contains("a.nav-link", "My Project").click({ force: true });
    // cy.url().should("include", "/project/myproject");
    // cy.contains(".custom-card-title", projectName)
    //   .parents(".custom-card")
    //   .within(() => {
    //     cy.get('a[aria-label="Edit"]').click();
    //   });
    // cy.url().should("include", "/project/edit/");

    // cy.get("input#title").clear().type("Updated Project Title");
    // cy.get("select#field").select("Data Science");
    // cy.get("textarea#description")
    //   .clear()
    //   .type("This is an updated description of the project.");
    // cy.get("input#requiredSkills")
    //   .clear()
    //   .type("Updated Skill 1, Updated Skill 2");
    // cy.get("input#maxTeams").clear().type("10");

    // cy.get('button[type="submit"]').click();
    // cy.url().should("include", "/project/myproject");

    // const PN = "EduBot Project";
    // cy.contains(".custom-card-title", PN)
    //   .parents(".custom-card")
    //   .within(() => {
    //     cy.get('button[aria-label="Teams"]').click();
    //   });
    // cy.get(".MuiDialogContent-root").should("be.visible");
    // cy.contains("h6", "No Teams Found").should("not.exist");
    // cy.contains("Allocated Team").click();
    // cy.contains("h6", "No Teams Found").should("not.exist");
    // cy.get("body").click(0, 0);
    // cy.get(".MuiDialogContent-root").should("not.exist");

    // const projectName1 = "New Project Title";
    // cy.get("input#title").type("New Project Title");
    // cy.get("select#field").select("Artificial Intelligence");
    // cy.get("textarea#description").type(
    //   "This is a description of the new project."
    // );
    // cy.get("input#requiredSkills").type("Skill 1, Skill 2");
    // cy.get("input#maxTeams").type("5");
    // cy.get('button[type="submit"]').click();
    // cy.url().should("include", "/project/myproject");

    // cy.contains(".custom-card-title", projectName)
    //   .parents(".custom-card")
    //   .within(() => {
    //     cy.get('button[aria-label="Archive"]').click();
    //   });
    // cy.get("button").contains("Archive").click({ force: true });
    // cy.url().should("include", "/project/myproject");

    // cy.contains(".custom-card-title", projectName1)
    //   .parents(".custom-card")
    //   .within(() => {
    //     cy.get('button[aria-label="Delete"]').click();
    //   });
    // cy.get("button").contains("Delete").click({ force: true });
  });
});
