import { Form } from "react-final-form";
import { Link } from "react-router-dom";
import MainButton from "../../components/shared/buttons/MainButton";
import Dropzone from "../../components/shared/formInputs/Dropzone";
import SelectInput from "../../components/shared/formInputs/SelectInput";
import TextInput from "../../components/shared/formInputs/TextInput";
import { useAddBook } from "../../hooks/books/useAddBook";
import { useGetAuthors } from "../../hooks/books/useGetAuthors";
import { useGetCategories } from "../../hooks/books/useGetCategories";
import type { ICreateBookData } from "../../types/staff/CreateBookData";
import GoBackButton from "../../components/shared/buttons/GoBackButton"; // Import GoBackButton

const AddBookPage = () => {
  const { categories, isPending: isCategoriesPending } = useGetCategories();
  const { authors, isPending: isAuthorsPending } = useGetAuthors();

  const isFormPending = isCategoriesPending || isAuthorsPending;

  const { createBook, isPending: isCreatingPending } = useAddBook();

  const onSubmit = async (values: ICreateBookData) => {
    const bookData = {
      ...values,
      price: Number(values.price),
      category_id: Number(values.category_id),
      author_id: Number(values.author_id),
      publish_year: Number(values.publish_year),
      purchase_available_stock: values.purchase_available_stock
        ? Number(values.purchase_available_stock)
        : undefined,
      borrow_available_stock: values.borrow_available_stock
        ? Number(values.borrow_available_stock)
        : undefined,
    };
    createBook(bookData);
  };

  const validate = (values: ICreateBookData) => {
    const errors: {
      [key in keyof ICreateBookData]?: string;
    } = {};

    if (!values.title) {
      errors.title = "Title is required";
    }

    if (!values.price) {
      errors.price = "Price is required";
    } else if (isNaN(Number(values.price)) || Number(values.price) <= 0) {
      errors.price = "Price must be a positive number";
    }

    if (!values.description) {
      errors.description = "Description is required";
    }

    if (!values.publish_year) {
      errors.publish_year = "Publish year is required";
    } else {
      const year = Number(values.publish_year);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1000 || year > currentYear) {
        errors.publish_year = "Please enter a valid year";
      }
    }

    const purchaseStock = Number(values.purchase_available_stock);
    const borrowStock = Number(values.borrow_available_stock);

    if (
      (!values.purchase_available_stock && !values.borrow_available_stock) ||
      ((isNaN(purchaseStock) || purchaseStock <= 0) &&
        (isNaN(borrowStock) || borrowStock <= 0))
    ) {
      errors.purchase_available_stock =
        "At least one of the stock fields must be greater than 0";
      errors.borrow_available_stock =
        "At least one of the stock fields must be greater than 0";
    }

    if (
      values.purchase_available_stock &&
      (isNaN(purchaseStock) || purchaseStock < 0)
    ) {
      errors.purchase_available_stock =
        "Purchase stock must be a non-negative number";
    }

    if (
      values.borrow_available_stock &&
      (isNaN(borrowStock) || borrowStock < 0)
    ) {
      errors.borrow_available_stock =
        "Borrow stock must be a non-negative number";
    }

    if (!values.category_id) {
      errors.category_id = "Category is required";
    } else if (isNaN(Number(values.category_id))) {
      errors.category_id = "Category ID must be a number";
    }

    if (!values.author_id) {
      errors.author_id = "Author is required";
    } else if (isNaN(Number(values.author_id))) {
      errors.author_id = "Author ID must be a number";
    }

    return errors;
  };

  const formData = [
    { name: "title", type: "text", placeholder: "Book Title" },
    { name: "price", type: "text", placeholder: "Price" },
    { name: "description", type: "text", placeholder: "Description" },
    { name: "publish_year", type: "number", placeholder: "Publish Year" },
    { name: "img_file", type: "dropzone", placeholder: "Cover Image" },
    {
      name: "category_id",
      type: "select",
      placeholder: "Select Category",
      options: categories || [],
      link: "/employee/books/create-category",
      linkText: "add new category",
    },
    {
      name: "author_id",
      type: "select",
      placeholder: "Select Author",
      options: authors || [],
      link: "/employee/books/create-author",
      linkText: "add new author",
    },
    {
      name: "purchase_available_stock",
      type: "number",
      placeholder: "Purchase Stock",
    },
    {
      name: "borrow_available_stock",
      type: "number",
      placeholder: "Borrow Stock",
    },
  ];

  return (
    <div className="relative flex flex-1 flex-col overflow-auto p-4 md:p-12">
      <GoBackButton to="/employee/books" label="Return to Books Table" />

      <h2 className="text-primary mt-12 text-center text-2xl font-bold md:mt-6">
        Create a New Book
      </h2>
      <Form
        onSubmit={onSubmit}
        validate={validate}
        render={({
          handleSubmit,
          submitting,
          pristine,
          hasValidationErrors,
        }) => (
          <form onSubmit={handleSubmit} className="mt-8">
            {isFormPending ? (
              <p>Loading categories and authors...</p>
            ) : (
              formData.map((item, index) => {
                if (item.type === "select") {
                  return (
                    <div key={index} className="mb-9 flex items-center gap-8">
                      <SelectInput
                        name={item.name}
                        placeholder={item.placeholder}
                        options={item.options}
                        containerClassName="flex-1"
                      />
                      {item.link && (
                        <Link
                          to={item.link}
                          className="text-primary hover:text-hover flex w-36 items-center gap-2 text-center text-sm font-semibold whitespace-nowrap transition-colors focus:outline-none"
                        >
                          + {item.linkText}
                        </Link>
                      )}
                    </div>
                  );
                } else if (item.type === "dropzone") {
                  return <Dropzone name={item.name} key={index} />;
                } else if (item.type === "number") {
                  return (
                    <TextInput
                      key={index}
                      name={item.name}
                      type="number"
                      placeholder={item.placeholder}
                    />
                  );
                }
                return (
                  <TextInput
                    key={index}
                    name={item.name}
                    type={item.type}
                    placeholder={item.placeholder}
                  />
                );
              })
            )}
            <div className="mt-6">
              <MainButton
                disabled={
                  submitting ||
                  pristine ||
                  hasValidationErrors ||
                  isCreatingPending
                }
                loading={isCreatingPending}
                label="Create Book"
              />
            </div>
          </form>
        )}
      />
    </div>
  );
};

export default AddBookPage;
