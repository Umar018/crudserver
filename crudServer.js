import http, { createServer } from "node:http";
import url from "node:url";
import fs from "node:fs";

const booksFile = "books.json";
let books = [];
try {
  const data = fs.readFileSync(booksFile, "utf8");
  books = JSON.parse(data) || [];
} catch (error) {
  console.error("Error reading books file:", error);
}

const PORT = 3000;
const server = createServer((request, response) => {
  const { method } = request;
  const parsedUrl = url.parse(request.url, true);

  if (method === "GET" && parsedUrl.pathname === "/books") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(books));
  } else if (method === "POST" && parsedUrl.pathname === "/books") {
    let body = "";
    request.on("data", (chunk) => (body += chunk));
    request.on("end", () => {
      try {
        const data = JSON.parse(body);
        if (!data.name) {
          throw new Error("Book name is required");
        }

        const newBook = {
          id: Math.floor(Math.random() * 100000),
          name: data.name,
        };
        books.push(newBook);

        fs.writeFileSync(booksFile, JSON.stringify(books, null, 2));

        response.writeHead(201, { "Content-Type": "application/json" });
        response.end(JSON.stringify(newBook));
      } catch (error) {
        response.writeHead(400, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ message: error.message }));
      }
    });
  } else if (method === "PUT" && parsedUrl.pathname.startsWith("/books/")) {
    const id = parseInt(parsedUrl.pathname.split("/")[2]);

    let body = "";
    request.on("data", (chunk) => (body += chunk));
    request.on("end", () => {
      try {
        const data = JSON.parse(body);
        if (!data.name) {
          throw new Error("Book name is required");
        }

        const index = books.findIndex((b) => b.id === id);
        if (index === -1) {
          response.writeHead(404, { "Content-Type": "application/json" });
          response.end(JSON.stringify({ message: "Book not found" }));
          return;
        }

        books[index].name = data.name;

        fs.writeFileSync(booksFile, JSON.stringify(books, null, 2));

        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify(books[index]));
      } catch (error) {
        response.writeHead(400, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ message: error.message }));
      }
    });
  } else if (method === "DELETE" && parsedUrl.pathname.startsWith("/books/")) {
    const id = parseInt(parsedUrl.pathname.split("/")[2]);

    const index = books.findIndex((b) => b.id === id);
    if (index === -1) {
      response.writeHead(404, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ message: "Book not found" }));
      return;
    }

    books.splice(index, 1);

    fs.writeFileSync(booksFile, JSON.stringify(books, null, 2));

    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ message: "Book deleted" }));
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
