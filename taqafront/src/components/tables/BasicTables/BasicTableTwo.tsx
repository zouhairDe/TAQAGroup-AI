"use client";
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { TrashBinIcon } from "../../../icons";
import AvatarText from "../../ui/avatar/AvatarText";

import Checkbox from "../../form/input/Checkbox";
import Badge from "../../ui/badge/Badge";

// Interface for the table row data
interface TableRowData {
  id: string; // Unique identifier for the row
  user: {
    initials: string; // Initials for the avatar
    name: string; // User's full name
    email: string; // User's email address
  };
  avatarColor: "brand" | "blue" | "green" | "red" | "yellow" | "gray"; // Color variant for the avatar
  product: {
    name: string; // Product name
    price: string; // Product price
    purchaseDate: string; // Date of purchase
  };
  status: {
    // label: string; // Status text
    type: "Complete" | "Warning" | "Cancel" | "Pending"; // Size of the badge
  };
  actions: {
    delete: boolean; // Indicates a delete action is available
  };
}

const tableRowData: TableRowData[] = [
  {
    id: "DE124321",
    user: {
      initials: "AB",
      name: "John Doe",
      email: "johndoe@gmail.com",
    },
    avatarColor: "brand",
    product: {
      name: "Software License",
      price: "$18,50.34",
      purchaseDate: "2024-06-15",
    },
    status: {
      type: "Complete",
    },
    actions: {
      delete: true,
    },
  },
  {
    id: "DE124322",
    user: {
      initials: "CD",
      name: "Jane Smith",
      email: "janesmith@gmail.com",
    },
    avatarColor: "brand",
    product: {
      name: "Cloud Hosting",
      price: "$12,99.00",
      purchaseDate: "2024-06-18",
    },
    status: {
      type: "Pending",
    },
    actions: {
      delete: true,
    },
  },
  {
    id: "DE124323",
    user: {
      initials: "EF",
      name: "Michael Brown",
      email: "michaelbrown@gmail.com",
    },
    avatarColor: "brand",
    product: {
      name: "Web Domain",
      price: "$9,50.00",
      purchaseDate: "2024-06-20",
    },
    status: {
      type: "Cancel",
    },
    actions: {
      delete: true,
    },
  },
  {
    id: "DE124324",
    user: {
      initials: "GH",
      name: "Alice Johnson",
      email: "alicejohnson@gmail.com",
    },
    avatarColor: "brand",
    product: {
      name: "SSL Certificate",
      price: "$2,30.45",
      purchaseDate: "2024-06-25",
    },
    status: {
      type: "Pending",
    },
    actions: {
      delete: true,
    },
  },
  {
    id: "DE124325",
    user: {
      initials: "IJ",
      name: "Robert Lee",
      email: "robertlee@gmail.com",
    },
    avatarColor: "brand",
    product: {
      name: "Premium Support",
      price: "$15,20.00",
      purchaseDate: "2024-06-30",
    },
    status: {
      type: "Complete",
    },
    actions: {
      delete: true,
    },
  },
];

export default function BasicTableTwo() {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedRows(tableRowData.map((row) => row.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleRowSelect = (id: string) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((rowId) => rowId !== id)
        : [...prevSelected, id]
    );
  };
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white pt-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex flex-col gap-4 px-6 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Orders
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            <svg
              className="stroke-current fill-white dark:fill-gray-800"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.29004 5.90393H17.7067"
                stroke=""
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17.7075 14.0961H2.29085"
                stroke=""
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12.0826 3.33331C13.5024 3.33331 14.6534 4.48431 14.6534 5.90414C14.6534 7.32398 13.5024 8.47498 12.0826 8.47498C10.6627 8.47498 9.51172 7.32398 9.51172 5.90415C9.51172 4.48432 10.6627 3.33331 12.0826 3.33331Z"
                fill=""
                stroke=""
                strokeWidth="1.5"
              />
              <path
                d="M7.91745 11.525C6.49762 11.525 5.34662 12.676 5.34662 14.0959C5.34661 15.5157 6.49762 16.6667 7.91745 16.6667C9.33728 16.6667 10.4883 15.5157 10.4883 14.0959C10.4883 12.676 9.33728 11.525 7.91745 11.525Z"
                fill=""
                stroke=""
                strokeWidth="1.5"
              />
            </svg>
            Filter
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            See all
          </button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="px-6 py-3.5 border-t border-gray-100 border-y bg-gray-50 dark:border-white/[0.05] dark:bg-gray-900">
            <TableRow>
              <TableCell className="px-6 py-3 font-medium text-gray-500 sm:px-6 text-theme-xs dark:text-gray-400 text-start">
                <div className="flex items-center gap-3">
                  <div>
                    <Checkbox checked={selectAll} onChange={handleSelectAll} />
                  </div>
                  <div>
                    <span className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                      Deal ID
                    </span>
                  </div>
                </div>
              </TableCell>

              <TableCell className="px-6 py-3 font-medium text-gray-500 sm:px-6 text-theme-xs dark:text-gray-400 text-start">
                Customer
              </TableCell>
              <TableCell className="px-6 py-3 font-medium text-gray-500 sm:px-6 text-theme-xs dark:text-gray-400 text-start">
                Product/Service
              </TableCell>
              <TableCell className="px-6 py-3 font-medium text-gray-500 sm:px-6 text-theme-xs dark:text-gray-400 text-start">
                Deal Value
              </TableCell>
              <TableCell className="px-6 py-3 font-medium text-gray-500 sm:px-6 text-theme-xs dark:text-gray-400 text-start">
                Close Date
              </TableCell>
              <TableCell className="px-6 py-3 font-medium text-gray-500 sm:px-6 text-theme-xs dark:text-gray-400 text-start">
                Status
              </TableCell>
              <TableCell className="px-6 py-3 font-medium text-gray-500 sm:px-6 text-theme-xs dark:text-gray-400 text-start">
                Action
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableRowData.map((row: TableRowData) => (
              <TableRow key={row.id}>
                <TableCell className="px-4 sm:px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <div>
                      <Checkbox
                        checked={selectedRows.includes(row.id)}
                        onChange={() => handleRowSelect(row.id)}
                      />
                    </div>
                    <div>
                      <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
                        {row.id}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 sm:px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <AvatarText name={row.user.name} className="w-10 h-10" />
                    <div>
                      <span className="mb-0.5 block text-theme-sm font-medium text-gray-700 dark:text-gray-400">
                        {row.user.name}
                      </span>
                      <span className="text-gray-500 text-theme-sm dark:text-gray-400">
                        {row.user.email}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 sm:px-6 py-3.5">
                  <p className="text-gray-700 text-theme-sm dark:text-gray-400">
                    {row.product.name}
                  </p>
                </TableCell>
                <TableCell className="px-4 sm:px-6 py-3.5">
                  <p className="text-gray-700 text-theme-sm dark:text-gray-400">
                    {row.product.price}
                  </p>
                </TableCell>
                <TableCell className="px-4 sm:px-6 py-3.5">
                  <p className="text-gray-700 text-theme-sm dark:text-gray-400">
                    {row.product.purchaseDate}
                  </p>
                </TableCell>
                <TableCell className="px-4 sm:px-6 py-3.5">
                  <Badge
                    variant="light"
                    color={
                      row.status.type === "Complete"
                        ? "success"
                        : row.status.type === "Pending"
                        ? "warning"
                        : "error"
                    }
                    size="sm"
                  >
                    {row.status.type}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 sm:px-6 py-3.5">
                  {row.actions.delete && (
                    <button>
                      <TrashBinIcon className="cursor-pointer  text-gray-700 hover:text-error-500 dark:text-gray-400 dark:hover:text-error-500" />
                    </button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
