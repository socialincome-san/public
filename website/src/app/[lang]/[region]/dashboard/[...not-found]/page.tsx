import { notFound } from 'next/navigation';

// https://stackoverflow.com/questions/77600623/not-found-page-demands-root-layout-meaning-multiple-root-layouts-not-possible
export default function Page() {
  notFound();
}
