import { redirect } from "next/navigation";

/** Muskoka is what ships first, so it is where this lands. */
export default function PanelIndex(): never {
  redirect("/panel/muskoka");
}
