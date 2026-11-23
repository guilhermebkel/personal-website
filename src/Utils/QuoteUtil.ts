import type { Quote } from "@/Protocols/QuoteProtocol.ts";

export class QuoteUtil {
  static readonly ALL: Quote[] = [
    {
      lines: ["Does not matter", "what you are doing,", "do it with excellence."],
      highlights: ["do it with excellence."],
    },
    {
      lines: ["Start learning by the surface", "and keep going deep", "to the abstractions."],
      highlights: ["and keep going deep", "to the abstractions."],
    },
    {
      lines: [
        "Try not to focus on learning new technologies,",
        "but improving your learning process",
        "for every single new technology you study.",
      ],
      highlights: ["but improving your learning process"],
    },
    {
      lines: ["Most of the time,", "the best software is", "the flexible one."],
      highlights: ["the flexible one."],
    },
  ];
}
