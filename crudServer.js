import http, { createServer } from "node:http";
import url from "node:url";

const books = [
  { id: 1, name: "Sariq devni minib" },
  { id: 2, name: "Chayon" }
];

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
      const data = JSON.parse(body);
      const newBook = { id: books.length + 1, name: data.name };
      books.push(newBook);
      response.writeHead(201, { "Content-Type": "application/json" });
      response.end(JSON.stringify(newBook));
    });
  } else if (method === "PUT" && parsedUrl.pathname.startsWith("/books/")) {
    const id = parseInt(parsedUrl.pathname.split("/")[2]);
    let body = "";
    request.on("data", (chunk) => (body += chunk));
    request.on("end", () => {
      const data = JSON.parse(body);
      const book = books.find((b) => b.id === id);
      if (!book) {
        response.writeHead(404, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ message: "Book not found" }));
        return;
      }
      book.name = data.name;
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify(book));
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
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ message: "Book deleted" }));
  } else {
    response.writeHead(404, { "Content-Type": "text/plain" });
    response.end("Not found!");
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
