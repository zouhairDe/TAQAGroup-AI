"use client";

import { useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../Label";
import Input from "../input/InputField";
import Select from "../Select";
import Radio from "../input/Radio";
import Form from "../Form";
import Button from "../../ui/button/Button";
import DatePicker from "@/components/form/date-picker";

export default function ExampleFormTwo() {
  const [selectedOption, setSelectedOption] = useState<string>("Free");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:");
  };

  const optionsGender = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Others" },
  ];
  const categoryOptions = [
    { value: "cate1", label: "Category 1" },
    { value: "cate2", label: "Category 2" },
    { value: "cate3", label: "Category 3" },
  ];
  const country = [
    { value: "bd", label: "Bangladesh" },
    { value: "usa", label: "United States" },
    { value: "canada", label: "Canada" },
  ];
  const handleSelectGender = (value: string) => {
    console.log("Selected value:", value);
  };

  const handleRadioChange = (value: string) => {
    setSelectedOption(value);
    console.log("Selected:", value);
  };

  return (
    <ComponentCard title="Example Form">
      <Form onSubmit={handleSubmit}>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="col-span-full">
            <h4 className="pb-4 text-base font-medium text-gray-800 border-b border-gray-200 dark:border-gray-800 dark:text-white/90">
              Personal Info
            </h4>
          </div>
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input type="text" placeholder="Enter first name" id="firstName" />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input type="text" placeholder="Enter last name" id="lastName" />
          </div>
          <div className="col-span-2">
            <Label htmlFor="email">Gender</Label>
            <Select
              options={optionsGender}
              placeholder="Select an option"
              onChange={handleSelectGender}
              defaultValue=""
              className="bg-gray-50 dark:bg-gray-800"
            />
          </div>

          <div className="col-span-2">
            <DatePicker
              id="dob-picker"
              label="Date of Birth"
              placeholder="Select an option"
              onChange={(dates, currentDateString) => {
                // Handle your logic
                console.log({ dates, currentDateString });
              }}
            />
          </div>

          <div className="col-span-2">
            <Label htmlFor="email">Category</Label>
            <Select
              options={categoryOptions}
              placeholder="Select an option"
              onChange={handleSelectGender}
              defaultValue=""
              className="bg-gray-50 dark:bg-gray-800"
            />
          </div>
          <div className="col-span-2">
            <h4 className="pb-4 text-base font-medium text-gray-800 border-b border-gray-200 dark:border-gray-800 dark:text-white/90">
              Address
            </h4>
          </div>
          <div className="col-span-2">
            <Label htmlFor="street">Street</Label>
            <Input type="text" id="street" />
          </div>
          <div>
            <Label htmlFor="street">City</Label>
            <Input type="text" id="city" />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input type="text" id="state" />
          </div>
          <div>
            <Label htmlFor="postCode">Post Code</Label>
            <Input type="text" id="postCode" />
          </div>
          <div>
            <Label htmlFor="email">Category</Label>
            <Select
              options={country}
              placeholder="--Select Country--"
              onChange={handleSelectGender}
              defaultValue=""
              className="bg-gray-50 dark:bg-gray-800"
            />
          </div>
          <div className="flex items-center gap-3 col-span-full">
            <Label className="m-0">Membership:</Label>
            <div className="flex flex-wrap items-center gap-4">
              <Radio
                id="Free"
                name="roleSelect"
                value="Free"
                label="Free"
                checked={selectedOption === "Free"}
                onChange={handleRadioChange}
              />
              <Radio
                id="Premium"
                name="roleSelect"
                value="Premium"
                label="Premium"
                checked={selectedOption === "Premium"}
                onChange={handleRadioChange}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button size="sm">Save Changes</Button>
            <Button size="sm" variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </Form>
    </ComponentCard>
  );
}
