import { Children, Fragment } from "react";

const Breadcrumb = ({ children }) => {
  const childrenArray = Children.toArray(children);

  const childrenWtihSeperator = childrenArray.map((child, index) => {
    if (index !== childrenArray.length - 1) {
      return <Fragment key={index}>{child}</Fragment>;
    }
    return child;
  });

  return (
    <nav aria-label="breadcrumb">
      <ul className="flex items-center justify-center sm:justify-start [&>*:last-child]:pointer-events-none">
        {childrenWtihSeperator}
      </ul>
    </nav>
  );
};

export default Breadcrumb;
