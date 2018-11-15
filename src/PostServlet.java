import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

// Declaring a WebServlet called StarServlet, which maps to url "/api/star"
@WebServlet(name = "PostServlet", urlPatterns = "/api/post")
public class PostServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		response.setCharacterEncoding("UTF-8");
		response.setContentType("application/json"); // Response mime type
		response.setHeader("Access-Control-Allow-Origin", "*");

		// Retrieve parameter limit from url request.
		String id = request.getParameter("id");

		// Output stream to STDOUT
		PrintWriter out = response.getWriter();

		try {
			Context initCtx = new InitialContext();

            Context envCtx = (Context) initCtx.lookup("java:comp/env");
            if (envCtx == null)
                throw new Exception("context is null");

            // Look up our data source
			DataSource dataSource = (DataSource) envCtx.lookup("jdbc/masterdb");
			
			// Get a connection from dataSource
			Connection dbcon = dataSource.getConnection();

			// Construct a query with parameter represented by "?"
			String query = "select title, author, content, p.category_id as c_id, tag_ids, p.update_time, c.name as c_name, i.thumb_url, i.url as photo_url from posts as p, categories as c, images as i where p.status = 1 and p.id = ? and p.image_header_id = i.id and p.category_id = c.id";

			// Declare our statement
			PreparedStatement statement = dbcon.prepareStatement(query);

			// Set the parameter represented by "?" in the query to the id we get from url,
			// num 1 indicates the first "?" in the query
			statement.setInt(1, Integer.parseInt(id));

			// Perform the query
			ResultSet rs = statement.executeQuery();

			JsonArray jsonArray = new JsonArray();

			// Iterate through each row of rs
			if (rs.next()) {

				String title = rs.getString("title");
				String author = rs.getString("author");
				String update_time = rs.getString("update_time");
				String content = rs.getString("content");
				String c_id = rs.getString("c_id");
				String c_name = rs.getString("c_name");
				String thumb_url = rs.getString("thumb_url");
				String photo_url = rs.getString("photo_url");
				String tag_ids = rs.getString("tag_ids");

				// Increment the pv
				String update = "update posts set pv = pv + 1 where id = ?";
				statement = dbcon.prepareStatement(update);
				statement.setInt(1, Integer.parseInt(id));
				statement.executeUpdate();

				// Get tag names
				query = "select id, name from tags where id in (" + tag_ids + ")";
				statement = dbcon.prepareStatement(query);
				rs = statement.executeQuery();
				JsonArray tagJsonArray = new JsonArray();
				while(rs.next()) {
					JsonObject tagJsonObject = new JsonObject();
					tagJsonObject.addProperty("id", rs.getString("id"));
					tagJsonObject.addProperty("name", rs.getString("name"));
					tagJsonArray.add(tagJsonObject);
				}

				// Create a JsonObject based on the data we retrieve from rs

				JsonObject jsonObject = new JsonObject();
				jsonObject.addProperty("id", id);
                jsonObject.addProperty("title", title);
                jsonObject.addProperty("content", content);
				jsonObject.addProperty("author", author);
				jsonObject.addProperty("c_id", c_id);
				jsonObject.addProperty("c_name", c_name);
				jsonObject.addProperty("thumb_url", thumb_url);
				jsonObject.addProperty("update_time", update_time);
				jsonObject.addProperty("photo_url", photo_url);
				jsonObject.add("tags", tagJsonArray);

				jsonArray.add(jsonObject);
			} else {
				throw new Exception("Post Not Found");
			}
			
            // write JSON string to output
            out.write(jsonArray.toString());
            // set response status to 200 (OK)
            response.setStatus(200);

			rs.close();
			statement.close();
			dbcon.close();
		} catch (Exception e) {
			// write error message JSON object to output
			JsonObject jsonObject = new JsonObject();
			jsonObject.addProperty("errorMessage", e.getMessage());
			out.write(jsonObject.toString());

			// set reponse status to 500 (Internal Server Error)
			response.setStatus(500);
		}
		out.close();

	}

}
