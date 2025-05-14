import style from "@/styles/modules/WorkProcess.module.scss";

const WorkProcess = ({ workProcess }) => {
  const { enable, title, subtitle, steps } = workProcess;

  if (!enable) return;

  return (
    <section className="pb-28">
      <div className="container">
        <div className="row mb-16 items-end">
          <div className="sm:col-7 order-2 sm:order-1">
            <h2 className="text-4xl md:text-5xl font-secondary font-medium -mt-[6px] text-center sm:text-left">
              {title}
            </h2>
          </div>
          <div className="sm:col-5 order-1 sm:order-2 block mb-4 sm:mb-0 text-center sm:text-right">
            <span className="font-secondary text-2xl leading-none text-white/75">
              {subtitle}
            </span>
          </div>
        </div>

        <div className={`${style["work-process"]} row md:gx-6 gy-6`}>
          {steps.map((step, i) => (
            <div
              key={i}
              className="lg:col-4 md:col-6"
              data-aos="fade-right"
              data-aos-delay={i * 100}
            >
              <div className={style["work-process-item"]}>
                <h3 className="text-3xl mb-6 flex items-center">
                  <span className="font-secondary font-medium">
                    {i + 1 < 10 ? `0${i + 1}` : i + 1}
                  </span>
                  <span className="font-secondary mx-4 font-thin">—</span>
                  <span>{step.title}</span>
                </h3>
                <div className="text-white/75 font-light text-lg">
                  {step.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default WorkProcess