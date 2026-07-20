import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DataTable from "@/app/admin/components/DataTable";

describe("DataTable Component", () => {
  const columns = [
    { key: "id", header: "ID" },
    { key: "name", header: "Name" },
  ];

  const data = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
    { id: 3, name: "Charlie" },
  ];

  it("renders data table properly", () => {
    render(<DataTable data={data} columns={columns} />);
    expect(screen.getByTestId("data-table")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("supports global filtering", () => {
    render(<DataTable data={data} columns={columns} />);
    const searchInput = screen.getByTestId("data-table-search");
    fireEvent.change(searchInput, { target: { value: "Ali" } });
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.queryByText("Bob")).not.toBeInTheDocument();
  });

  it("supports sorting", () => {
    render(<DataTable data={data} columns={columns} />);
    const nameHeader = screen.getByTestId("col-name");

    // Sort asc
    fireEvent.click(nameHeader);
    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Alice");

    // Sort desc
    fireEvent.click(nameHeader);
    const rowsDesc = screen.getAllByRole("row");
    expect(rowsDesc[1]).toHaveTextContent("Charlie");
  });

  it("supports pagination", () => {
    render(<DataTable data={data} columns={columns} pageSize={2} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.queryByText("Charlie")).not.toBeInTheDocument();

    const nextBtn = screen.getByTestId("data-table-next");
    fireEvent.click(nextBtn);

    expect(screen.queryByText("Alice")).not.toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();
  });
});
