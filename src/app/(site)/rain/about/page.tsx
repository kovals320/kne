import Image from "next/image";
import { Page } from "@/modules/rain/ui";
import station from "@/modules/rain/station.jpg";

export const metadata = { title: "אודות – משקעים" };

export default function AboutPage() {
  return (
    <Page active={"/rain/about"}>
      <section className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
        <Image
          src={station}
          alt="התחנה המטאורולוגית בניר אליהו"
          priority
          placeholder="blur"
          sizes="(min-width: 1024px) 1024px, 100vw"
          className="h-auto w-full"
        />
        <div className="px-5 py-5">
        <h2 className="sr-only">אודות</h2>
        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            בשנים <span dir="ltr">1968–2021</span>, יותר מחמישים שנה, מדד ברוך ראובני את כמות המשקעים בתחנה המטאורולוגית בניר אליהו. המדידות כללו גם
            התאדות יומית. על סמך הנתונים שאסף ברוך, השקו החקלאים את השדות והמטעים.
          </p>
          <p>
            תחילה נאספו הנתונים בפנקסים, בכתב יד, ומשנות ה-90, בעזרתו של רפי בורץ, התחיל ברוך לאסוף את הנתונים בטבלאות אקסל.
            כל בוקר, בשעה 8:00, בדיוק של שעון שוויצרי, היה ברוך מוזג את הגשם שהצטבר במיכל למבחנה עם שנתות, וכמה דקות אחרי
            ארוחת הבוקר, כבר היה מדווח לשירות המטאורולוגי.
          </p>
          <p>וכך נמסר לנו מנועם חלפון מאגף האקלים בשירות המטאורולוגי:</p>
          <blockquote className="border-s-4 border-rain bg-sky px-4 py-3 rounded-e-xl">
            &quot;איש אדמה אמיתי, שמדד במסירות ובאהבה כל מילימטר של גשם. למדידותיו הייתה חשיבות רבה, והסתייענו בהם לצורך
            היערכות עיריית כפר סבא לשינויי האקלים... למרות גילו היה מהצופים הראשונים שעברו לדיווח ממוחשב ומהיר.&quot;
          </blockquote>
          <p>
            ברוך נפטר באוגוסט 2021, והתחנה נמסרה לידיו האמונות של ענבר גולן, וגם עברה דירה, בגלל הקמת השכונה החדשה.
          </p>
          <p>
            כעת נאספו כל המדידות, כ-4000 במספר, מהאתר של השירות המטאורולוגי ומקובץ האקסל שממשיך להתמלא, ובעזרת דן קובלסקי
            ודור הורביץ כל הנתונים מונגשים עבורכם ביישומון החדש.
          </p>
          <p className="font-bold">נתחדש!</p>
        </div>
        </div>
      </section>
    </Page>
  );
}
