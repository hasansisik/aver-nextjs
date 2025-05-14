import { capitalizeText } from "@/utils/capitalizeText";
import Link from "next/link";

const BreadcrumbItem = ({ children, href, isCurrent, ...props }) => {
  return (
    <li {...props}>
      <Link className="link" href={href} passHref>
        {capitalizeText(children)}
      </Link>
    </li>
  );
};

export default BreadcrumbItem;
