import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

// Define the TypeScript interface for the table rows
interface Product {
  id: number; // Unique identifier for each product
  name: string; // Product name
  category: string; // Category of the product
  country: string; // Price of the product (as a string with currency symbol)
  cr: string; // URL or path to the product image
  value: string;
}

// Define the table data using the interface
const tableData: Product[] = [
  {
    id: 1,
    name: "TailGrids",
    category: "UI Kits",
    country: "/images/country/country-01.svg",
    cr: "Dashboard",
    value: "12,499", // Replace with actual image URL
  },
  {
    id: 2,
    name: "GrayGrids",
    category: "Templates",
    country: "/images/country/country-02.svg",
    cr: "Dashboard",
    value: "5498", // Replace with actual image URL
  },
  {
    id: 3,
    name: "Uideck",
    category: "Templates",
    country: "/images/country/country-03.svg",
    cr: "Dashboard",
    value: "4621", // Replace with actual image URL
  },
  {
    id: 4,
    name: "FormBold",
    category: "SaaS",
    country: "/images/country/country-04.svg",
    cr: "Dashboard",
    value: "13843", // Replace with actual image URL
  },
  {
    id: 5,
    name: "NextAdmin",
    category: "Templates",
    country: "/images/country/country-05.svg",
    cr: "Dashboard",
    value: "7523", // Replace with actual image URL
  },
  {
    id: 6,
    name: "Form Builder",
    category: "Templates",
    country: "/images/country/country-06.svg",
    cr: "Dashboard",
    value: "1,377", // Replace with actual image URL
  },
  {
    id: 7,
    name: "AyroUI",
    category: "Templates",
    country: "/images/country/country-07.svg",
    cr: "Dashboard",
    value: "599,00", // Replace with actual image URL
  },
];

export default function BasicTableFive() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white  dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="px-4 pt-4 sm:px-6">
        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Recent Orders
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
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
            <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
              See all
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-gray-100 border-y dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-4 py-3 font-medium text-gray-500 sm:px-6 text-start text-theme-xs dark:text-gray-400"
              >
                Products
              </TableCell>
              <TableCell
                isHeader
                className="px-4 py-3 font-medium text-gray-500 sm:px-6 text-start text-theme-xs dark:text-gray-400"
              >
                Category
              </TableCell>
              <TableCell
                isHeader
                className="px-4 py-3 font-medium text-gray-500 sm:px-6 text-start text-theme-xs dark:text-gray-400"
              >
                Country
              </TableCell>
              <TableCell
                isHeader
                className="px-4 py-3 font-medium text-gray-500 sm:px-6 text-start text-theme-xs dark:text-gray-400"
              >
                CR
              </TableCell>
              <TableCell
                isHeader
                className="px-4 py-3 font-medium text-gray-500 sm:px-6 text-start text-theme-xs dark:text-gray-400"
              >
                Value
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {tableData.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="px-4 py-3 font-medium text-gray-800 sm:px-6 text-start text-theme-sm dark:text-white/90">
                  {product.name}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 sm:px-6 text-start text-theme-sm dark:text-gray-400">
                  {product.category}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 sm:px-6 text-start text-theme-sm dark:text-gray-400">
                  <div className="w-5 h-5 overflow-hidden rounded-full">
                    <Image
                      width={20}
                      height={20}
                      src={product.country}
                      className="w-5 h-5 rounded-full"
                      alt="country"
                    />
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 sm:px-6 text-start text-theme-sm dark:text-gray-400">
                  {product.cr}
                </TableCell>
                <TableCell className="px-4 text-theme-sm sm:px-6 text-start text-success-600">
                  ${product.value}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
