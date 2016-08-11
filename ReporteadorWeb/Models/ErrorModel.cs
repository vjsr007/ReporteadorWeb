using System;

namespace PoliticaEgresos.Web.Models
{
    public class ErrorModel
    {
        public int HttpStatusCode { get; set; }

        public Exception Exception { get; set; }
    }
}