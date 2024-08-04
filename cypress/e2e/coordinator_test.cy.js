describe("Coordinator Path Test", () => {
  it("successfully loads", () => {
    cy.viewport(1600, 800);

    //login
    cy.visit("http://localhost:3333/login");
    cy.get("input#email").type("coordinator1@unsw.edu");
    cy.get("input#password").type("admin123");
    cy.get("button#buttonLogin").click();

    cy.wait(1000);
    cy.scrollTo("top");

    // to myproject
    cy.contains("a.nav-link", "My Project").click({ force: true });
    cy.url().should("include", "/project/myproject");
    cy.wait(1000);
    cy.scrollTo("top");
    cy.contains("button", "+ Create Project").click();
    cy.url().should("include", "/project/create");
    cy.wait(1000);
    cy.scrollTo("top");

    const projectName = "New Project Title";
    cy.get("input#title").type("New Project Title");
    cy.get("select#field").select("Artificial Intelligence");
    cy.get("textarea#description").type(
      "This is a description of the new project."
    );
    cy.get("input#email").type("client1@unsw.edu");
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
    cy.scrollTo("top");

    // to all project
    cy.contains("a.nav-link", "All Project").click({ force: true });
    cy.url().should("include", "/project/allproject");
    cy.wait(1000);
    cy.scrollTo("top");
    cy.wait(2000);
    cy.scrollTo("bottom", { duration: 5000 });
    cy.contains(".custom-card-title", projectName).should("be.visible").click();
    cy.url().should("include", `/project/details/`);

    cy.contains("a", "Click here to download the project specification")
      .should("have.attr", "href")
      .then((href) => {
        cy.request(href).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.headers["content-type"]).to.eq("application/pdf");
        });
      });
    cy.wait(2000);
    cy.scrollTo("top");

    // edit project
    cy.contains("a.nav-link", "My Project").click({ force: true });
    cy.url().should("include", "/project/myproject");
    cy.wait(1000);
    cy.scrollTo("top");
    cy.contains(".custom-card-title", "Project 2")
      .parents(".custom-card")
      .within(() => {
        cy.get('a[aria-label="Edit"]').click();
      });
    cy.url().should("include", "/project/edit/");
    cy.wait(1000);
    cy.scrollTo("top");

    cy.get("input#title").clear().type("Updated Project Title");
    cy.get("select#field").select("Data Science");
    cy.get("textarea#description")
      .clear()
      .type("This is an updated description of the project.");
    cy.get("input#requiredSkills")
      .clear()
      .type("Updated Skill 1, Updated Skill 2");
    cy.get("input#maxTeams").clear().type("10");

    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/project/myproject");
    cy.wait(2000);
    cy.scrollTo("top");

    cy.contains(".custom-card-title", "Updated Project Title")
      .parents(".custom-card")
      .within(() => {
        cy.get('a[aria-label="Edit"]').click();
      });
    cy.url().should("include", "/project/edit/");
    cy.wait(1000);
    cy.scrollTo("top");

    cy.get("input#title").clear().type("Project 2");
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/project/myproject");
    cy.wait(1000);
    cy.scrollTo("top");

    // view preferencelist and allocated teams
    const PN = "Project 2";
    cy.contains(".custom-card-title", PN)
      .parents(".custom-card")
      .within(() => {
        cy.get('button[aria-label="Teams"]').click();
      });
    cy.get(".MuiDialogContent-root").should("be.visible");
    cy.contains("h6", "No Teams Found").should("exist");
    cy.wait(1000);
    cy.contains("Allocated Team").click();
    cy.contains("h6", "No Teams Found").should("exist");
    cy.wait(1000);
    cy.get("body").click(0, 0);
    cy.get(".MuiDialogContent-root").should("not.exist");

    // logout
    cy.contains("a", "Logout").invoke("removeAttr", "target").click();
    cy.url().should("include", "/login");
  });
});
